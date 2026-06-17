<?php

/**
 * WSMS (WP SMS) Integration
 */

namespace BitApps\Integrations\Actions\Wsms;

use WP_Error;

/**
 * Provide functionality for WSMS (WP SMS) integration
 */
class WsmsController
{
    public static function isExists()
    {
        if (!\defined('WP_SMS_VERSION')) {
            wp_send_json_error(
                __(
                    'WSMS (WP SMS) is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function wsmsAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshGroups()
    {
        self::isExists();

        $groups = [];

        if (class_exists('\WP_SMS\Newsletter')) {
            $allGroups = \WP_SMS\Newsletter::getGroups();

            foreach ($allGroups ?: [] as $group) {
                $groups[] = (object) [
                    'value' => (int) $group->ID,
                    'label' => $group->name,
                ];
            }
        }

        $response['groups'] = $groups;
        wp_send_json_success($response, 200);
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
        $wsmsResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($wsmsResponse)) {
            return $wsmsResponse;
        }

        return $wsmsResponse;
    }
}
