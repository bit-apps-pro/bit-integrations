<?php

namespace BitApps\Integrations\Core\Util;

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

    /**
     * isEmpty function check ('0', 0, 0.0) is exists
     *
     * @param string $val
     *
     * @return bool
     */
    public static function isEmpty($val)
    {
        return (bool) (empty($val) && !\in_array($val, ['0', 0, 0.0], true));
    }

    /**
     * Replaces file url with dir path
     *
     * @param array|string $file Single or multiple files URL
     *
     * @return string|array
     */
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

    /**
     * SSRF-safe outbound GET (CWE-918).
     *
     * Validates the URL with wp_http_validate_url() (http/https scheme only,
     * blocks most private ranges) and additionally blocks link-local / reserved
     * ranges that WordPress misses (e.g. 169.254.0.0/16 cloud metadata, IPv6
     * loopback/ULA) for external hosts. The site's own host is always allowed so
     * legitimate fetches of the site's own uploads URL keep working. Returns a
     * WP_Error for disallowed URLs so existing is_wp_error() callers short-circuit.
     *
     * @param string $url
     * @param array  $args
     *
     * @return array|\WP_Error
     */
    public static function safeRemoteGet($url, $args = [])
    {
        if (!self::isSafeRemoteUrl($url)) {
            return new \WP_Error('bit_integrations_blocked_url', __('The requested URL is not allowed.', 'bit-integrations'));
        }

        return wp_safe_remote_get($url, $args);
    }

    /**
     * Whether $url is a public http/https URL safe to fetch server-side.
     *
     * @param string $url
     *
     * @return bool
     */
    public static function isSafeRemoteUrl($url)
    {
        if (!\is_string($url) || $url === '' || !wp_http_validate_url($url)) {
            return false;
        }

        $host = wp_parse_url($url, PHP_URL_HOST);
        if (empty($host)) {
            return false;
        }

        // Always allow the site's own host (mirrors wp_http_validate_url's home-host
        // allowance) so fetching the site's own uploads URL is not blocked on
        // installs whose host resolves to a private/loopback IP (local/staging).
        $homeHost = wp_parse_url(home_url(), PHP_URL_HOST);
        if (!empty($homeHost) && strtolower($host) === strtolower($homeHost)) {
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

        // Deny unresolvable hostnames — allowing them through would let a DNS failure
        // bypass all IP range checks (the foreach below would iterate zero times).
        // Note: DNS-rebinding (TOCTOU) between this check and wp_safe_remote_get's
        // own resolution is an inherent limitation of server-side DNS validation.
        if (empty($ips)) {
            return false;
        }

        foreach ($ips as $ip) {
            // Reject private (10/8, 172.16/12, 192.168/16, fc00::/7, fe80::/10) and
            // reserved (0/8, 127/8, 169.254/16, ::1, ...) ranges -> blocks loopback
            // and cloud-metadata SSRF targets.
            if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Resolve a mapped file value to a local path contained within the WordPress
     * uploads directory (LFI / path-traversal guard, CWE-22). A same-site uploads
     * URL is first converted to its local path; any value carrying a URL scheme
     * (remote URL / php:// / file:// wrappers) or resolving outside the uploads
     * directory is rejected.
     *
     * @param string      $file
     * @param string|null $baseDir Directory the resolved path must stay within.
     *                             Defaults to the WordPress uploads base dir.
     *
     * @return string Contained absolute path, or '' if not allowed
     */
    public static function safeUploadFilePath($file, $baseDir = null)
    {
        if (!\is_string($file) || $file === '') {
            return '';
        }

        // Convert a same-site uploads URL to its local filesystem path.
        $file = self::filePath($file);

        // Reject anything still carrying a scheme (external URL or stream wrapper).
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

    /**
     * Replaces dir path with url
     *
     * @param array|string $file Single or multiple files path
     *
     * @return string|array
     */
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

    /**
     * Helps to verify condition
     *
     * @param array $condition Conditional logic
     * @param array $data      Trigger data
     *
     * @return bool
     */
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
