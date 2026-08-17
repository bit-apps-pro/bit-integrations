<?php

/**
 * SureMembers Integration
 */

namespace BitApps\Integrations\Actions\SureMembers;

use SureMembers\Inc\Access_Groups;
use WP_Error;

/**
 * Provide functionality for SureMembers integration
 */
class SureMembersController
{
    public static function checkedSureMembersExists()
    {
        if (!is_plugin_active('suremembers/suremembers.php')) {
            wp_send_json_error(
                __(
                    'SureMembers Plugin is not active or not installed',
                    'bit-integrations'
                ),
                400
            );
        } else {
            return true;
        }
    }

    public function getGroups()
    {
        self::checkedSureMembersExists();

        $accessGroups = Access_Groups::get_active();

        if (empty($accessGroups)) {
            wp_send_json_error(
                __(
                    'No access groups found!',
                    'bit-integrations'
                ),
                400
            );
        }

        foreach ($accessGroups as $key => $accessGroup) {
            $groups[] = (object) ['label' => $accessGroup, 'value' => (string) $key];
        }

        wp_send_json_success($groups, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        self::checkedSureMembersExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $selectedGroup = $integrationDetails->selectedGroup;

        if (empty($fieldMap) || empty($selectedTask) || empty($selectedGroup)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and group are required for SureMembers', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integId);
        $sureMembersResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedGroup);

        if (is_wp_error($sureMembersResponse)) {
            return $sureMembersResponse;
        }

        return $sureMembersResponse;
    }
}
