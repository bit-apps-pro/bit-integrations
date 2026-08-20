<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Authorization\Support\AuthDataCodec;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Evaluates a caller-supplied spec describing how to detect whether a
 * WordPress plugin (Plugin) is available. Used by the shared Plugin-check
 * authorization step for integrations that target a WP plugin and need no
 * external API credentials.
 *
 * Owns all spec sanitization + validation — controllers pass the raw request
 * shape through and let this class normalize it.
 *
 * Spec shape (groups — supports nested AND/OR):
 *   [
 *     'logic'  => 'AND' | 'OR', // outer combiner across groups (default AND)
 *     'groups' => [
 *       [
 *         'logic'  => 'AND' | 'OR', // combines this group's checks (default AND)
 *         'checks' => [
 *           ['type' => 'class',       'value' => 'Foo'],
 *           ['type' => 'function',    'value' => 'foo_init'],
 *           ['type' => 'constant',    'value' => 'FOO_FILE', 'expected' => 'foo/foo.php'],
 *         ],
 *       ],
 *     ],
 *   ]
 *
 * Flat shape (single implicit group):
 *   ['checks' => [...], 'logic' => 'AND' | 'OR']
 */
final class PluginCheck
{
    private const ALLOWED_TYPES = ['class', 'function', 'constant', 'plugin_file'];

    private const ALLOWED_LOGIC = ['AND', 'OR'];

    /**
     * Constants whose VALUE must never be comparable through a check.
     *
     * The 'constant' check reports whether constant(X) === expected for a caller-supplied
     * X, which is an equality oracle: repeated calls can confirm a guessed DB_PASSWORD or
     * AUTH_KEY one candidate at a time. Existence (defined()) leaks nothing and stays
     * allowed — only the comparison is refused, and it is refused rather than answered so
     * a denied probe is indistinguishable from a wrong guess.
     */
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

    /**
     * Name fragments marking a constant as secret-bearing, so plugin-defined credentials
     * (ACME_API_SECRET, FOO_PRIVATE_KEY) are covered without enumerating them. A legitimate
     * activation check asserts on a path or version, never on a value named like this.
     */
    private const VALUE_COMPARISON_DENIED_PATTERNS = [
        'PASSWORD',
        'SECRET',
        'SALT',
        'PRIVATE',
        'TOKEN',
    ];

    /**
     * @param array $spec accepts groups OR flat checks; nested values may be stdClass
     *
     * @return array{available:bool,message?:string}
     */
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

    /**
     * Normalize spec into a list of groups. A flat `checks` array is treated as
     * a single implicit group so callers keep working.
     *
     * @return array<int,array{logic:string,checks:array}>
     */
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

    /**
     * @param array<int,bool> $results
     */
    private static function combine(array $results, string $logic): bool
    {
        return $logic === 'OR'
            ? \in_array(true, $results, true)
            : !\in_array(false, $results, true);
    }

    /**
     * Whether comparing this constant's value would expose a secret.
     */
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

    /**
     * @param null|bool|float|int|string $expected
     */
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
