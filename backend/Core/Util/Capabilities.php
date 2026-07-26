<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Config;

final class Capabilities
{
    /**
     * Plugin-specific capabilities. Holding any one of these (or `manage_options`)
     * grants access to the plugin's admin AJAX surface.
     *
     * @var string[]
     */
    private const INTEGRATION_CAPABILITIES = [
        'manage_integrations',
        'view_integrations',
        'create_integrations',
        'edit_integrations',
        'delete_integrations',
    ];

    /**
     * The subset of the above that implies authority to change something.
     *
     * @var string[]
     */
    private const INTEGRATION_WRITE_CAPABILITIES = [
        'manage_integrations',
        'create_integrations',
        'edit_integrations',
        'delete_integrations',
    ];

    public static function Check($cap, ...$args)
    {
        return current_user_can($cap, ...$args);
    }

    public static function Filter($cap, $default = 'manage_options')
    {
        return static::Check(Hooks::apply($cap, $default));
    }

    /**
     * Whether the current user holds any Bit Integrations capability (or is an
     * administrator). Used as the baseline authorization gate for every
     * authenticated AJAX route so that a valid nonce alone is never sufficient to
     * reach a handler.
     *
     * @return bool
     */
    public static function hasIntegrationAccess()
    {
        return static::holdsAnyOf(self::INTEGRATION_CAPABILITIES);
    }

    /**
     * Whether the current user may change integration state, as opposed to only viewing it.
     *
     * `view_integrations` is deliberately absent. Integration-owned AJAX routes (per-action
     * and per-trigger `Routes.php`) authorize credentials, hit third-party APIs and mutate
     * connection config, and those controllers add no capability check of their own — so a
     * read-only role must not reach them just by holding one plugin capability.
     *
     * @return bool
     */
    public static function hasIntegrationWriteAccess()
    {
        return static::holdsAnyOf(self::INTEGRATION_WRITE_CAPABILITIES);
    }

    /**
     * @param string[] $capabilities Unprefixed plugin capabilities
     *
     * @return bool
     */
    private static function holdsAnyOf(array $capabilities)
    {
        if (static::Check('manage_options')) {
            return true;
        }

        foreach ($capabilities as $capability) {
            if (static::Check(Config::withPrefix($capability))) {
                return true;
            }
        }

        return false;
    }
}
