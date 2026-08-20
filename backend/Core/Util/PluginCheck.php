<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Authorization\Support\AuthDataCodec;

if (!defined('ABSPATH')) {
    exit;
}

final class PluginCheck
{
    private const ALLOWED_TYPES = ['class', 'function', 'constant', 'plugin_file'];

    private const ALLOWED_LOGIC = ['AND', 'OR'];

    private const VALUE_COMPARISON_DENIED = [
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD',
        'DB_HOST',
        'AUTH_KEY',
        'SECURE_AUTH_KEY',
        'LOGGED_IN_KEY',
        'NONCE_KEY',
        'AUTH_SALT',
        'SECURE_AUTH_SALT',
        'LOGGED_IN_SALT',
        'NONCE_SALT',
    ];

    private const VALUE_COMPARISON_DENIED_PATTERNS = [
        'PASSWORD',
        'SECRET',
        'SALT',
        'PRIVATE',
        'TOKEN',
    ];

    public static function evaluate(array $spec): array
    {
        $groups = self::normalizeGroups($spec);

        if (empty($groups)) {
            return [
                'available' => false,
                'message'   => __('Plugin checks are required', 'bit-integrations'),
            ];
        }

        $outerLogic = self::normalizeLogic($spec['logic'] ?? null);
        $groupResults = [];

        foreach ($groups as $group) {
            $checkResults = [];

            foreach ($group['checks'] as $check) {
                $check = AuthDataCodec::toArray($check);

                $type = $check['type'] ?? null;
                $value = $check['value'] ?? null;

                if (!\in_array($type, self::ALLOWED_TYPES, true) || !\is_scalar($value) || $value === '') {
                    continue;
                }

                $hasExpected = \array_key_exists('expected', $check);
                $expected = $check['expected'] ?? null;

                if ($hasExpected && !\is_scalar($expected) && $expected !== null) {
                    continue;
                }

                $checkResults[] = self::matches($type, (string) $value, $hasExpected, $expected);
            }

            if (empty($checkResults)) {
                continue;
            }

            $groupResults[] = self::combine($checkResults, $group['logic']);
        }

        if (empty($groupResults)) {
            return [
                'available' => false,
                'message'   => __('No valid Plugin checks were provided', 'bit-integrations'),
            ];
        }

        if (self::combine($groupResults, $outerLogic)) {
            return ['available' => true];
        }

        return [
            'available' => false,
            'message'   => __('Plugin is not installed or activated', 'bit-integrations'),
        ];
    }

    private static function normalizeGroups(array $spec): array
    {
        $rawGroups = AuthDataCodec::toArray($spec['groups'] ?? null);

        if (!empty($rawGroups)) {
            $groups = [];

            foreach ($rawGroups as $group) {
                $group = AuthDataCodec::toArray($group);
                $checks = AuthDataCodec::toArray($group['checks'] ?? null);

                if (empty($checks)) {
                    continue;
                }

                $groups[] = [
                    'logic'  => self::normalizeLogic($group['logic'] ?? null),
                    'checks' => $checks,
                ];
            }

            return $groups;
        }

        $checks = AuthDataCodec::toArray($spec['checks'] ?? null);

        if (empty($checks)) {
            return [];
        }

        return [[
            'logic'  => 'AND',
            'checks' => $checks,
        ]];
    }

    private static function normalizeLogic($raw): string
    {
        if (!\is_scalar($raw)) {
            return 'AND';
        }

        $normalized = strtoupper((string) $raw);

        return \in_array($normalized, self::ALLOWED_LOGIC, true) ? $normalized : 'AND';
    }

    private static function combine(array $results, string $logic): bool
    {
        return $logic === 'OR'
            ? \in_array(true, $results, true)
            : !\in_array(false, $results, true);
    }

    private static function isValueComparisonDenied(string $name): bool
    {
        $name = strtoupper($name);

        if (\in_array($name, self::VALUE_COMPARISON_DENIED, true)) {
            return true;
        }

        foreach (self::VALUE_COMPARISON_DENIED_PATTERNS as $fragment) {
            if (strpos($name, $fragment) !== false) {
                return true;
            }
        }

        return false;
    }

    private static function matches(string $type, string $value, bool $hasExpected = false, $expected = null): bool
    {
        switch ($type) {
            case 'class':
                return class_exists($value);
            case 'function':
                return \function_exists($value);
            case 'constant':
                if (!\defined($value)) {
                    return false;
                }

                if (!$hasExpected) {
                    return true;
                }

                if (self::isValueComparisonDenied($value)) {
                    return false;
                }

                return \constant($value) === $expected;
            case 'plugin_file':
                if (!\function_exists('is_plugin_active')) {
                    require_once ABSPATH . 'wp-admin/includes/plugin.php';
                }

                return is_plugin_active($value);
            default:
                return false;
        }
    }
}
