<?php

/**
 * Power Coupons Integration
 */

namespace BitApps\Integrations\Actions\PowerCoupons;

use WP_Error;

if (!defined('ABSPATH')) {
    exit;
}

class PowerCouponsController
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $powerCouponsResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($powerCouponsResponse)) {
            return $powerCouponsResponse;
        }

        return $powerCouponsResponse;
    }

    public static function isPluginInstalled()
    {
        return (class_exists('\WooCommerce') || function_exists('WC'))
            && (
                defined('POWER_COUPONS_VERSION')
                || function_exists('power_coupons')
                || class_exists('\Power_Coupons\Power_Coupons_Loader')
            );
    }
}
