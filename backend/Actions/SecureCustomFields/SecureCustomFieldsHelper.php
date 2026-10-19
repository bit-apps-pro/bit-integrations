<?php

namespace BitApps\Integrations\Actions\SecureCustomFields;

class SecureCustomFieldsHelper
{
    /**
     * Whether the Secure Custom Fields plugin (not another ACF-compatible plugin) is the active one.
     *
     * SCF defines ACF_BASENAME from its own main file, so the basename uniquely
     * identifies it versus Advanced Custom Fields / ACF Pro.
     *
     * @return bool
     */
    public static function isPluginActive()
    {
        if (\defined('ACF_BASENAME') && ACF_BASENAME === 'secure-custom-fields/secure-custom-fields.php') {
            return true;
        }

        // Fallback: ACF_BASENAME can be claimed by ACF/ACF Pro when loaded first, and a
        // non-standard install dir would miss the constant check, so verify by plugin file.
        if (!\function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        return \function_exists('is_plugin_active') && is_plugin_active('secure-custom-fields/secure-custom-fields.php');
    }
}
