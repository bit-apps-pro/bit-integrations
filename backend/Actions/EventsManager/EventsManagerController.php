<?php

/**
 * Events Manager Integration
 */

namespace BitApps\Integrations\Actions\EventsManager;

use WP_Error;

/**
 * Provide functionality for Events Manager integration
 */
class EventsManagerController
{
    public static function isExists()
    {
        if (!class_exists('EM_Events')) {
            wp_send_json_error(
                __(
                    'Events Manager is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function eventsManagerAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
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
