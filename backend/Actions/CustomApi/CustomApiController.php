<?php

/**
 * CustomApi Integration
 */

namespace BitApps\Integrations\Actions\CustomApi;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class CustomApiController
{
    public static function execute($integrationDetails, $fieldValues)
    {
        $fieldValues = self::iterate($fieldValues);
        $details = $integrationDetails->flow_details;
        $type = $details->type;
        $integId = isset($integrationDetails->id) ? $integrationDetails->id : '';
        $method = isset($details->actionMethod) ? $details->actionMethod : 'get';
        $pathParams = isset($details->pathParams) ? $details->pathParams : [];
        $url = isset($details->url) ? self::urlParserWrapper($details->url, $fieldValues, $pathParams) : false;
        if (empty($url)) {
            $url = new \WP_Error(Config::withPrefix('custom-api-url'), __('Api endpoint is empty', 'bit-integrations'));
        }

        if (is_wp_error($url)) {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $type]), 'error', $url);

            return $url;
        }
        $payload = self::processPayload($details, $fieldValues);
        $headers = self::processHeaders($details, $fieldValues);

        if ($details->authType === 'apikey') {
            if ($details->apiKeyAddTo === 'query') {
                $separator = (strpos($url, '?') !== false) ? '&' : '?';
                $url = "{$url}{$separator}{$details->key}={$details->value}";
            } else {
                $headers = array_merge($headers, [$details->key => $details->value]);
            }
        } elseif ($details->authType === 'bearer') {
            $headers = array_merge($headers, [$details->key => $details->token]);
        } elseif ($details->authType === 'basic') {
            $headers = array_merge($headers, [$details->key => 'Basic ' . base64_encode("{$details->username}:{$details->password}")]);
        }

        if ($url) {
            switch (strtoupper($method)) {
                case 'GET':
                    $response = HttpHelper::get($url, $payload, $headers);

                    break;

                case 'POST':
                    $response = HttpHelper::post($url, $payload, $headers);

                    break;

                default:
                    $response = HttpHelper::request($url, $method, $payload, $headers);

                    break;
            }
        }

        if (is_wp_error($response) || !empty($response->error)) {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $type]), 'error', $response);
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $type]), 'success', !empty($response) ? wp_json_encode($response) : 'Successfully executed webhook');
        }

        return $response;
    }

    private static function urlParserWrapper($url, $fieldValues = [], $pathParams = [])
    {
        if (empty($url)) {
            return $url;
        }
        $parsedURL = wp_parse_url($url);

        $Scheme = isset($parsedURL['scheme']) ? $parsedURL['scheme'] . '://' : null;
        $Usr = isset($parsedURL['usr']) ? $parsedURL['usr'] : null;
        $Pass = isset($parsedURL['pass']) ? ':' . $parsedURL['pass'] : null;
        $Host = isset($parsedURL['host']) ? $parsedURL['host'] : null;
        $Port = isset($parsedURL['port']) ? ':' . $parsedURL['port'] : null;
        $Path = isset($parsedURL['path']) ? $parsedURL['path'] : null;
        $Query = isset($parsedURL['query']) ? $parsedURL['query'] : null;
        $Pass = ($Pass || $Usr) ? "{$Pass}@" : null;

        $Path = self::resolvePathParams($Path, $pathParams, $fieldValues);
        if (is_wp_error($Path)) {
            return $Path;
        }

        $cleanURL = "{$Scheme}{$Usr}{$Pass}{$Host}{$Port}{$Path}";
        $params = [];

        if (empty($Query)) {
            return $cleanURL;
        }

        foreach (explode('&', $Query) as $keyValue) {
            if (empty($keyValue)) {
                continue;
            }
            list($field, $value) = explode('=', $keyValue);
            if ('' == trim($value)) {
                continue;
            }
            if (isset($params[$field])) {
                if (\is_array($params[$field])) {
                    $params[$field][] = sanitize_text_field($value);
                } else {
                    $params[$field] = [$params[$field], sanitize_text_field($value)];
                }
            } else {
                $params[$field] = sanitize_text_field($value);
            }
        }

        $params = Common::replaceFieldWithValue($params, $fieldValues);
        $params = http_build_query($params);
        if (!empty($params)) {
            $cleanURL .= "?{$params}";
        }

        return $cleanURL;
    }

    private static function resolvePathParams($path, $pathParams, $fieldValues)
    {
        if (empty($path) || false === strpos($path, '{')) {
            return $path;
        }

        $mapping = [];
        foreach ((array) $pathParams as $param) {
            $param = (object) $param;
            if (!isset($param->key) || '' === trim((string) $param->key)) {
                continue;
            }
            $mapping[trim((string) $param->key)] = isset($param->value) ? $param->value : '';
        }

        $emptyTokens = [];
        $resolvedPath = preg_replace_callback(
            '/\$\{\w[^ ${}]*\}|\{[^{}\s\/?#]+\}/',
            function ($matches) use ($mapping, $fieldValues, &$emptyTokens) {
                $token = $matches[0];

                if (0 === strpos($token, '${')) {
                    $value = Common::replaceFieldWithValue($token, $fieldValues);
                } else {
                    $name = substr($token, 1, -1);
                    if (!\array_key_exists($name, $mapping)) {
                        return $token;
                    }
                    $value = Common::replaceFieldWithValue($mapping[$name], $fieldValues);
                }

                if (\is_array($value) || \is_object($value)) {
                    $value = wp_json_encode($value);
                }
                $value = trim((string) $value);

                if ('' === $value) {
                    $emptyTokens[$token] = true;

                    return $token;
                }

                return rawurlencode($value);
            },
            $path
        );

        if (!empty($emptyTokens)) {
            return new \WP_Error(
                Config::withPrefix('custom-api-path-param'),
                \sprintf(
                    // translators: %s: comma separated url path variables, e.g. {id}, {slug}
                    __('Url path variable %s has no value, api request skipped', 'bit-integrations'),
                    implode(', ', array_keys($emptyTokens))
                )
            );
        }

        return null === $resolvedPath ? $path : $resolvedPath;
    }

    private static function processHeaders($details, $fieldValues)
    {
        $headers = isset($details->headers) ? self::processKeyValue((array) $details->headers, $fieldValues) : [];
        if (isset($details->body->type)) {
            $headers['Content-Type'] = $details->body->type === 'raw' ? 'application/json' : $details->body->type;
        }

        return $headers;
    }

    private static function processPayload($details, $fieldValues)
    {
        if ($details->body->type === 'raw' && isset($details->body->raw)) {
            return Common::replaceFieldWithValue(sanitize_text_field($details->body->raw), $fieldValues);
        }

        $payload = [];
        if (isset($details->body->data)) {
            $fieldValues = self::pushMissingFields($fieldValues, $details->body->data);
            $payload = self::processKeyValue($details->body->data, $fieldValues);
        }

        if (isset($details->body->type) && ($details->body->type === 'application/json' || $details->body->type === 'raw')) {
            $payload = wp_json_encode((object) $payload, JSON_PRETTY_PRINT);
        }

        return $payload;
    }

    private static function pushMissingFields($fieldValues, $fields)
    {
        foreach ($fields as $field) {
            if (!isset($fieldValues[$field->key])) {
                $fieldValues[$field->key] = '';
            }
        }

        return $fieldValues;
    }

    private static function processKeyValue($data, $fieldValues)
    {
        $processedData = [];
        foreach ($data as $keyValuePair) {
            $processedData[$keyValuePair->key] = Common::replaceFieldWithValue(sanitize_text_field($keyValuePair->value), $fieldValues);
        }

        return $processedData;
    }

    private static function iterate($array)
    {
        $ar = [];
        if (\is_array($array)) {
            foreach ($array as $k => $v) {
                if (\is_string($v)) {
                    $ar[$k] = str_replace("\'", "'", $v);
                } else {
                    $ar[$k] = $v;
                }
            }
        }

        return $ar;
    }
}
