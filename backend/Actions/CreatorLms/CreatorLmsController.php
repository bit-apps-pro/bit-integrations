<?php

/**
 * Creator LMS Integration
 */

namespace BitApps\Integrations\Actions\CreatorLms;

use WP_Error;

/**
 * Provide functionality for Creator LMS integration
 */
class CreatorLmsController
{
    public static function isExists()
    {
        if (!class_exists('CreatorLms') || !\function_exists('crlms_get_course')) {
            wp_send_json_error(
                __(
                    'Creator LMS is not activated or not installed',
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
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
