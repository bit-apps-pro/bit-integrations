<?php

/**
 * Ultimate Affiliate Pro Integration
 */

namespace BitApps\Integrations\Actions\UltimateAffiliatePro;

use WP_Error;

/**
 * Provide functionality for Ultimate Affiliate Pro integration.
 */
class UltimateAffiliateProController
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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $response = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($response)) {
            return $response;
        }

        return $response;
    }
}
