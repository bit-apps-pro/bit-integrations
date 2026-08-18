<?php

/**
 * WebHooks Integration
 */

namespace BitApps\Integrations\Actions\WebHooks;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for webhooks
 */
class WebHooksController
{
    public static function testWebhook($webhookDetails)
    {
        $data['flow_details'] = $webhookDetails->hookDetails;
        $response = self::execute((object) $data, [], true);
        $responseCode = HttpHelper::$responseCode;

        if (is_wp_error($response)) {
            wp_send_json_error(
                empty($response) ? 'Unknown Error Occurred' : $response->get_error_message(),
                400
            );
        }

        if (self::hasFailed($response, $responseCode)) {
            wp_send_json_error(
                \sprintf(
                    // translators: %s: http status code returned by the webhook url
                    __('Webhook responded with status %s', 'bit-integrations'),
                    $responseCode
                ),
                400
            );
        }

        wp_send_json_success(
            empty($responseCode)
                ? __('Test webhook executed successfully', 'bit-integrations')
                : \sprintf(
                    // translators: %s: http status code returned by the webhook url
                    __('Test webhook executed successfully (status %s)', 'bit-integrations'),
                    $responseCode
                ),
            200
        );
    }

    public static function execute($integrationDetails, $fieldValues, $isTest = false)
    {
        $fieldValues = self::iterate($fieldValues);
        $details = $integrationDetails->flow_details;
        $type = $details->type;
        $integId = isset($integrationDetails->id) ? $integrationDetails->id : '';
        $method = isset($details->method) ? $details->method : 'get';
        $pathParams = isset($details->pathParams) ? $details->pathParams : [];
        $url = isset($details->url) ? self::urlParserWrapper($details->url, $fieldValues, $pathParams, $isTest) : false;
        if (empty($url)) {
            $url = new \WP_Error('bit-integrations-webhook-url', __('Webhook url is empty', 'bit-integrations'));
        }
        if (is_wp_error($url)) {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $type]), 'error', $url);

            return $url;
        }
        $boundary = wp_generate_password(24);
        $payload = self::processPayload($details, $fieldValues, $boundary);
        $headers = self::processHeaders($details, $fieldValues, $boundary);

        switch (strtoupper($method)) {
            case 'GET':
                $response = HttpHelper::get($url, [], $headers);

                break;

            case 'POST':
                $response = HttpHelper::post($url, $payload, $headers);

                break;

            default:
                $response = HttpHelper::request($url, $method, $payload, $headers);

                break;
        }

        $responseCode = HttpHelper::$responseCode;

        if (self::hasFailed($response, $responseCode)) {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $type]), 'error', wp_json_encode(['status' => $responseCode, 'response' => $response]));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $type]), 'success', !empty($response) ? wp_json_encode($response) : 'Successfully executed webhook');
        }

        return $response;
    }

    /**
     * Decides whether a webhook run failed.
     *
     * A remote that answers 404 or 500 still returns a decoded body, so the status
     * code is the only reliable signal. An unknown code (transport level failure
     * already covered by is_wp_error) is not treated as a failure on its own.
     *
     * @param mixed    $response
     * @param null|int $responseCode
     *
     * @return bool
     */
    private static function hasFailed($response, $responseCode)
    {
        if (is_wp_error($response)) {
            return true;
        }

        if (\is_object($response) && !empty($response->error)) {
            return true;
        }

        if (empty($responseCode) || !is_numeric($responseCode)) {
            return false;
        }

        return $responseCode < 200 || $responseCode >= 300;
    }

    /**
     * Rebuilds the webhook url, resolving smart tags in the query string and in
     * the url path (dynamic route parameters).
     *
     * @param string       $url
     * @param array        $fieldValues Trigger data
     * @param array|object $pathParams  Placeholder => value map, e.g. [{key: 'id', value: '${post_id}'}]
     * @param bool         $isTest      Test Webhook run, no trigger data available
     *
     * @return string|WP_Error
     */
    private static function urlParserWrapper($url, $fieldValues = [], $pathParams = [], $isTest = false)
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

        // resolved after parsing, so a dynamic value can never rewrite scheme/host/port
        $Path = self::resolvePathParams($Path, $pathParams, $fieldValues, $isTest);
        if (is_wp_error($Path)) {
            return $Path;
        }

        $cleanURL = "{$Scheme}{$Usr}{$Pass}{$Host}{$Port}{$Path}";
        $params = [];
        foreach (explode('&', (string) $Query) as $keyValue) {
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
        if ('' !== $params) {
            $cleanURL .= "?{$params}";
        }

        return $cleanURL;
    }

    /**
     * Replaces dynamic route parameters in the url path.
     *
     * Two notations are supported:
     * - `{name}`     mapped to a value through the `pathParams` config
     * - `${field}`   smart tag written inline in the path
     *
     * Resolved values are raw url encoded, so they always stay inside the single
     * path segment they were written in.
     *
     * @param null|string  $path
     * @param array|object $pathParams
     * @param array        $fieldValues
     * @param bool         $isTest
     *
     * @return null|string|WP_Error
     */
    private static function resolvePathParams($path, $pathParams, $fieldValues, $isTest = false)
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
            function ($matches) use ($mapping, $fieldValues, $isTest, &$emptyTokens) {
                $token = $matches[0];

                if (0 === strpos($token, '${')) {
                    $value = Common::replaceFieldWithValue($token, $fieldValues);
                } else {
                    $name = substr($token, 1, -1);
                    if (!\array_key_exists($name, $mapping)) {
                        return $token; // not mapped, keep the literal placeholder
                    }
                    $value = Common::replaceFieldWithValue($mapping[$name], $fieldValues);
                }

                if (\is_array($value) || \is_object($value)) {
                    $value = wp_json_encode($value);
                }
                $value = trim((string) $value);

                if ('' === $value) {
                    if ($isTest) {
                        return $token; // no trigger data while testing, keep it visible
                    }
                    $emptyTokens[$token] = true;

                    return $token;
                }

                return rawurlencode($value);
            },
            $path
        );

        if (!empty($emptyTokens)) {
            return new \WP_Error(
                Config::withPrefix('webhook-path-param'),
                \sprintf(
                    // translators: %s: comma separated url path variables, e.g. {id}, {slug}
                    __('Url path variable %s has no value, webhook request skipped', 'bit-integrations'),
                    implode(', ', array_keys($emptyTokens))
                )
            );
        }

        return null === $resolvedPath ? $path : $resolvedPath;
    }

    private static function processHeaders($details, $fieldValues, $boundary = null)
    {
        $headers = isset($details->headers) ? self::processKeyValue((array) $details->headers, $fieldValues) : [];
        if (isset($details->body->type)) {
            if ('multipart/form-data' === $details->body->type) {
                $headers['Content-Type'] = 'multipart/form-data; boundary=' . $boundary;
            } else {
                $headers['Content-Type'] = $details->body->type === 'raw' ? 'application/json' : $details->body->type;
            }
        }

        return $headers;
    }

    private static function processPayload($details, $fieldValues, $boundary)
    {
        if ($details->body->type === 'raw' && isset($details->body->raw)) {
            return Common::replaceFieldWithValue(sanitize_text_field($details->body->raw), $fieldValues);
        }

        $payload = [];
        if (isset($details->body->data)) {
            $fieldValues = self::pushMissingFields($fieldValues, $details->body->data);
            $payload = self::processKeyValue($details->body->data, $fieldValues);
        }
        if (isset($details->body->type) && $details->body->type === 'application/json' || $details->body->type === 'raw') {
            $payload = wp_json_encode((object) $payload, JSON_PRETTY_PRINT);
        } elseif ('multipart/form-data' === $details->body->type) {
            if (!empty($payload)) {
                $payloadString = '';
                foreach ($payload as $key => $value) {
                    $payloadString .= '--' . $boundary;
                    $payloadString .= "\r\n";
                    $payloadString .= 'Content-Disposition: form-data; name="' . $key
                        . '"' . "\r\n\r\n";
                    $payloadString .= $value;
                    $payloadString .= "\r\n";
                }
                $payloadString .= '--' . $boundary . '--';

                return $payloadString;
            }
        }

        return $payload;
    }

    private static function pushMissingFields($fieldValues, $fields)
    {
        foreach ($fields as $field) {
            if (isset($field->key) && !isset($fieldValues[$field->key])) {
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
