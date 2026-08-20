<?php

namespace BitApps\Integrations\Core\Util;

use BitApps\Integrations\Config;

final class Capabilities
{
    private const INTEGRATION_CAPABILITIES = [
        'manage_integrations',
        'view_integrations',
        'create_integrations',
        'edit_integrations',
        'delete_integrations',
    ];

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

    public static function hasIntegrationAccess()
    {
        return static::holdsAnyOf(self::INTEGRATION_CAPABILITIES);
    }

    public static function hasIntegrationWriteAccess()
    {
        return static::holdsAnyOf(self::INTEGRATION_WRITE_CAPABILITIES);
    }

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
