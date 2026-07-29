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
        if (static::Check('manage_options')) {
            return true;
        }

        foreach (self::INTEGRATION_CAPABILITIES as $capability) {
            if (static::Check(Config::withPrefix($capability))) {
                return true;
            }
        }

        return false;
    }
}
