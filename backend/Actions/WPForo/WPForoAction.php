<?php

namespace BitApps\Integrations\Actions\WPForo;

use WP_Error;

class WPForoAction
{
    public function execute($integrationData, $fieldValues)
    {
        WPForoHelper::checkedWPForoExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $selectedReputation = $integrationDetails->selectedReputation;
        $selectedGroup = $integrationDetails->selectedGroup;
        $selectedForum = $integrationDetails->selectedForum;
        $selectedTags = $integrationDetails->selectedTags;
        $actions = $integrationDetails->actions;
        $selectedTopic = $integrationDetails->selectedTopic;

        if (empty($fieldMap) || empty($selectedTask)
        || ($selectedTask === 'userReputation' && empty($selectedReputation))
        || ($selectedTask === 'addToGroup' && empty($selectedGroup))
        || ($selectedTask === 'createTopic' && empty($selectedForum))) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task and group are required for WPForo', 'bit-integrations'));
        }

        $topicOptions = [
            'selectedForum' => $selectedForum,
            'selectedTags'  => $selectedTags,
            'actions'       => $actions
        ];

        $recordApiHelper = new WPForoService($integId);
        $wpforoResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedReputation, $selectedGroup, $topicOptions, $selectedTopic);

        if (is_wp_error($wpforoResponse)) {
            return $wpforoResponse;
        }

        return $wpforoResponse;
    }
}
