<?php

/**
 * ConvertForce Integration
 */

namespace BitApps\Integrations\Actions\ConvertForce;

use WP_Error;

/**
 * Provide functionality for ConvertForce integration
 */
class ConvertForceController
{
    public static function isExists()
    {
        if (!\defined('CONVERTFORCE_VERSION')) {
            wp_send_json_error(
                __(
                    'ConvertForce Popup Builder is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function convertForceAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
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

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
