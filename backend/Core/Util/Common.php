<?php

namespace BitApps\Integrations\Core\Util;

use WP_Error;

final class Common
{
    public static function replaceFieldWithValue($dataToReplaceField, $fieldValues)
    {
        if (empty($dataToReplaceField)) {
            return $dataToReplaceField;
        }

        if (\is_string($dataToReplaceField)) {
            $dataToReplaceField = static::replaceFieldWithValueHelper($dataToReplaceField, $fieldValues);
        } elseif (\is_array($dataToReplaceField)) {
            foreach ($dataToReplaceField as $field => $value) {
                if (\is_array($value) && \count($value) === 1) {
                    $dataToReplaceField[$field] = static::replaceFieldWithValueHelper($value[0], $fieldValues);
                } elseif (\is_array($value)) {
                    $dataToReplaceField[$field] = static::replaceFieldWithValue($value, $fieldValues);
                } else {
                    $dataToReplaceField[$field] = static::replaceFieldWithValueHelper($value, $fieldValues);
                }
            }
        }

        return $dataToReplaceField;
    }

    public static function isEmpty($val)
    {
        return (bool) (empty($val) && !\in_array($val, ['0', 0, 0.0], true));
    }

    public static function filePath($file)
    {
        $upDir = wp_upload_dir();
        $fileBaseURL = $upDir['baseurl'];
        $fileBasePath = $upDir['basedir'];
        if (\is_array($file)) {
            $path = [];
            foreach ($file as $fileIndex => $fileUrl) {
                $path[$fileIndex] = str_replace($fileBaseURL, $fileBasePath, $fileUrl);
            }
        } else {
            $path = str_replace($fileBaseURL, $fileBasePath, $file);
        }

        return $path;
    }

    public static function safeRemoteGet($url, $args = [])
    {
        if (!self::isSafeRemoteUrl($url)) {
            return new WP_Error('bit_integrations_blocked_url', __('The requested URL is not allowed.', 'bit-integrations'));
        }

        return wp_safe_remote_get($url, $args);
    }

    public static function isSafeRemoteUrl($url, $allowHomeHost = true)
    {
        if (!\is_string($url) || $url === '' || !wp_http_validate_url($url)) {
            return false;
        }

        $host = wp_parse_url($url, PHP_URL_HOST);
        if (empty($host)) {
            return false;
        }

        $homeHost = wp_parse_url(home_url(), PHP_URL_HOST);
        if ($allowHomeHost && !empty($homeHost) && strtolower($host) === strtolower($homeHost)) {
            return true;
        }

        $ips = [];
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            $ips[] = $host;
        } else {
            $records = @dns_get_record($host, DNS_A | DNS_AAAA);
            if (\is_array($records)) {
                foreach ($records as $record) {
                    if (!empty($record['ip'])) {
                        $ips[] = $record['ip'];
                    }
                    if (!empty($record['ipv6'])) {
                        $ips[] = $record['ipv6'];
                    }
                }
            }
            if (empty($ips)) {
                $resolved = gethostbyname($host);
                if ($resolved && $resolved !== $host) {
                    $ips[] = $resolved;
                }
            }
        }

        if (empty($ips)) {
            return false;
        }

        foreach ($ips as $ip) {
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return false;
            }
        }

        return true;
    }

    public static function isPublicHttpsUrl($url): bool
    {
        if (!\is_string($url) || $url === '') {
            return false;
        }

        if (Hooks::apply('bit_integrations_allow_internal_connection_url', false, $url)) {
            return true;
        }

        $parts = wp_parse_url($url);

        if (!$parts || empty($parts['scheme']) || empty($parts['host'])) {
            return false;
        }

        if (strtolower($parts['scheme']) !== 'https') {
            return false;
        }

        $host = strtolower($parts['host']);

        if (\in_array($host, ['localhost', 'localhost.localdomain', 'ip6-localhost', 'ip6-loopback'], true)) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return (bool) filter_var(
                $host,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            );
        }

        return true;
    }

    public static function safeUploadFilePath($file, $baseDir = null)
    {
        if (!\is_string($file) || $file === '') {
            return '';
        }

        $file = self::filePath($file);

        if (wp_parse_url($file, PHP_URL_SCHEME) !== null) {
            return '';
        }

        $real = realpath($file);
        if ($real === false || !is_file($real)) {
            return '';
        }

        if ($baseDir === null) {
            $uploadDir = wp_upload_dir();
            $baseDir = empty($uploadDir['basedir']) ? '' : $uploadDir['basedir'];
        }

        if ($baseDir === '') {
            return '';
        }

        $base = realpath($baseDir);
        if ($base === false) {
            return '';
        }

        $base = rtrim($base, '/\\') . DIRECTORY_SEPARATOR;

        return strpos($real, $base) === 0 ? $real : '';
    }

    public static function fileUrl($file)
    {
        $upDir = wp_upload_dir();
        $fileBaseURL = $upDir['baseurl'];
        $fileBasePath = str_replace('\\', '/', $upDir['basedir']);

        if (\is_array($file)) {
            $url = array_map(function ($filePath) use ($fileBasePath, $fileBaseURL) {
                return str_replace($fileBasePath, $fileBaseURL, $filePath);
            }, $file);
        } else {
            $url = str_replace($fileBasePath, $fileBaseURL, $file);
        }

        return $url;
    }

    public static function checkCondition($condition, $data)
    {
        if (\is_array($condition)) {
            foreach ($condition as $sskey => $ssvalue) {
                if (!\is_string($ssvalue)) {
                    $isCondition = self::checkCondition($ssvalue, $data);
                    if ($sskey === 0) {
                        $conditionSatus = $isCondition;
                    }
                    if ($sskey - 1 >= 0 && \is_string($condition[$sskey - 1])) {
                        switch (strtolower($condition[$sskey - 1])) {
                            case 'or':
                                $conditionSatus = $conditionSatus || $isCondition;

                                break;

                            case 'and':
                                $conditionSatus = $conditionSatus && $isCondition;

                                break;

                            default:
                                break;
                        }
                    }
                }
            }

            return (bool) $conditionSatus;
        }
        $condition->val = self::replaceFieldWithValue($condition->val, $data);

        if (!empty($data[$condition->field]) && (\is_array($data[$condition->field]) || \is_object($data[$condition->field]))) {
            $fieldValue = $data[$condition->field];
            $valueToCheck = explode(',', $condition->val);
            $isArr = true;
        } else {
            $fieldValue = $data[$condition->field] ?? null;
            $valueToCheck = $condition->val;
            $isArr = false;
        }

        switch ($condition->logic) {
            case 'equal':
                if ($isArr) {
                    if (\count($valueToCheck) !== \count($fieldValue)) {
                        return false;
                    }
                    $checker = 0;
                    foreach ($valueToCheck as $key => $value) {
                        if (!empty($fieldValue) && \in_array($value, $fieldValue)) {
                            $checker = $checker + 1;
                        }
                    }

                    return (bool) ($checker === \count($valueToCheck) && \count($valueToCheck) === \count($fieldValue));
                }

                return $fieldValue === $valueToCheck;

            case 'not_equal':
                if ($isArr) {
                    $valueToCheckLenght = \count($valueToCheck);
                    if ($valueToCheckLenght !== \count($fieldValue)) {
                        return true;
                    }
                    $checker = 0;
                    foreach ($valueToCheck as $key => $value) {
                        if (!\in_array($value, $fieldValue)) {
                            ++$checker;
                        }
                    }

                    return $valueToCheckLenght === $checker;
                }

                return $fieldValue !== $valueToCheck;

            case 'null':
                return empty($data[$condition->field]);

            case 'not_null':
                return !empty($data[$condition->field]);

            case 'contain':
                if (empty($fieldValue)) {
                    return false;
                }
                if ($isArr) {
                    $checker = 0;
                    foreach ($valueToCheck as $key => $value) {
                        if (\in_array($value, $fieldValue)) {
                            $checker = $checker + 1;
                        }
                    }

                    return (bool) ($checker > 0);
                }

                return stripos($fieldValue, $valueToCheck) !== false;

            case 'contain_all':
                if (empty($fieldValue)) {
                    return false;
                }
                if ($isArr) {
                    $checker = 0;
                    foreach ($valueToCheck as $key => $value) {
                        if (\in_array($value, $fieldValue)) {
                            $checker = $checker + 1;
                        }
                    }

                    return (bool) ($checker >= \count($valueToCheck));
                }

                return stripos($fieldValue, $valueToCheck) !== false;

            case 'not_contain':
                if (empty($fieldValue)) {
                    return false;
                }
                if ($isArr) {
                    $checker = 0;
                    foreach ($valueToCheck as $key => $value) {
                        if (!\in_array($value, $fieldValue)) {
                            $checker = $checker + 1;
                        }
                    }

                    return (bool) ($checker === \count($valueToCheck));
                }

                return stripos($fieldValue, $valueToCheck) === false;

            case 'greater':
                if (empty($fieldValue)) {
                    return false;
                }

                return $data[$condition->field] > $condition->val;

            case 'less':
                if (empty($fieldValue)) {
                    return false;
                }

                return $fieldValue < $valueToCheck;

            case 'greater_or_equal':
                if (empty($fieldValue)) {
                    return false;
                }

                return $fieldValue >= $valueToCheck;

            case 'less_or_equal':
                if (empty($fieldValue)) {
                    return false;
                }

                return $fieldValue <= $valueToCheck;

            case 'start_with':
                if (empty($fieldValue)) {
                    return false;
                }

                return stripos($fieldValue, $valueToCheck) === 0;

            case 'end_with':
                if (empty($fieldValue)) {
                    return false;
                }
                $fieldValue = $fieldValue;
                $fieldValueLength = \strlen($fieldValue);
                $compareValue = strtolower($valueToCheck);
                $compareValueLength = \strlen($valueToCheck);
                $fieldValueEnds = strtolower(substr($fieldValue, $fieldValueLength - $compareValueLength, $fieldValueLength));

                return $compareValue === $fieldValueEnds;

            default:
                return false;
        }
    }

    private static function replaceFieldWithValueHelper($stringToReplaceField, $fieldValues)
    {
        if (empty($stringToReplaceField)) {
            return $stringToReplaceField;
        }
        $fieldPattern = '/\${\w[^ ${}]*}/';
        preg_match_all($fieldPattern, $stringToReplaceField, $matchedField);
        $uniqueFieldsInStr = array_unique($matchedField[0]);
        foreach ($uniqueFieldsInStr as $field) {
            $fieldName = substr($field, 2, \strlen($field) - 3);
            $smartTagValue = SmartTags::getSmartTagValue($fieldName, true);
            if (isset($fieldValues[$fieldName]) && !self::isEmpty($fieldValues[$fieldName])) {
                $stringToReplaceField = !\is_array($fieldValues[$fieldName]) && !\is_object($fieldValues[$fieldName]) ? str_replace($field, $fieldValues[$fieldName], $stringToReplaceField)
                    : str_replace(['"' . $field . '"', $field], wp_json_encode($fieldValues[$fieldName], JSON_UNESCAPED_UNICODE), $stringToReplaceField);
            } elseif (!empty($smartTagValue)) {
                $stringToReplaceField = str_replace($field, $smartTagValue, $stringToReplaceField);
            } else {
                $stringToReplaceField = str_replace($field, '', $stringToReplaceField);
            }
        }

        return $stringToReplaceField;
    }
}
