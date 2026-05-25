<?php

/**
 * PeepSo Integration
 */

namespace BitApps\Integrations\Actions\PeepSo;

use WP_Error;

/**
 * Provide functionality for PeepSo integration
 */
class PeepSoController
{
    public static function isExists()
    {
        if (!class_exists('PeepSo')) {
            wp_send_json_error(
                __(
                    'PeepSo is not activated or not installed',
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

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
