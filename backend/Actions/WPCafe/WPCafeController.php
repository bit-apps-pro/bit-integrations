<?php

/**
 * WPCafe Integration.
 */

namespace BitApps\Integrations\Actions\WPCafe;

use WP_Error;

/**
 * Provide functionality for WPCafe integration.
 */
class WPCafeController
{
    public static function isExists()
    {
        if (!class_exists('WpCafe\Init')) {
            wp_send_json_error(
                __(
                    'WPCafe is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $wpcafeResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($wpcafeResponse)) {
            return $wpcafeResponse;
        }

        return $wpcafeResponse;
    }
}
