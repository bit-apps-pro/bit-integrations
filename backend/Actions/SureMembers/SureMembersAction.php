<?php

namespace BitApps\Integrations\Actions\SureMembers;

use WP_Error;

class SureMembersAction
{
    public function execute($integrationData, $fieldValues)
    {
        SureMembersHelper::checkedSureMembersExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $selectedGroup = $integrationDetails->selectedGroup;

        if (empty($fieldMap) || empty($selectedTask) || empty($selectedGroup)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and group are required for SureMembers', 'bit-integrations'));
        }

        $recordApiHelper = new SureMembersService($integId);
        $sureMembersResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedGroup);

        if (is_wp_error($sureMembersResponse)) {
            return $sureMembersResponse;
        }

        return $sureMembersResponse;
    }
}
