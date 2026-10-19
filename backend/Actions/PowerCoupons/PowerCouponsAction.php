<?php

/**
 * Power Coupons Integration
 */

namespace BitApps\Integrations\Actions\PowerCoupons;

use WP_Error;

if (!defined('ABSPATH')) {
    exit;
}

class PowerCouponsAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new PowerCouponsService($integrationDetails, $integId);
        $powerCouponsResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($powerCouponsResponse)) {
            return $powerCouponsResponse;
        }

        return $powerCouponsResponse;
    }
}
