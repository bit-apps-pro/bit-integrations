<?php

namespace BitApps\Integrations\Actions\UltimateAffiliatePro;

class UltimateAffiliateProHelper
{
    public static function pluginActive()
    {
        if (!\function_exists('is_plugin_active')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $plugins = [
            'ultimate-affiliate/ultimate-affiliate.php',
            'ultimate-affiliate-pro/ultimate-affiliate-pro.php',
            'indeed-affiliate-pro/indeed-affiliate-pro.php',
        ];

        foreach ($plugins as $pluginFile) {
            if (\function_exists('is_plugin_active') && is_plugin_active($pluginFile)) {
                return true;
            }
        }

        return false;
    }

    public static function isExists()
    {
        if (!self::pluginActive()) {
            wp_send_json_error(
                __('Ultimate Affiliate Pro is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }
}
