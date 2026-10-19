<?php

/**
 * Voxel Integration
 */

namespace BitApps\Integrations\Actions\Voxel;

use WP_Error;

class VoxelAction
{
    public function execute($integrationData, $fieldValues)
    {
        VoxelHelper::checkIfVoxelExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;

        if (empty($fieldMap) || empty($selectedTask)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task are required for Voxel', 'bit-integrations'));
        }

        $selectedOptions = [
            'actions'            => (array) $integrationDetails->actions,
            'selectedPostType'   => $integrationDetails->selectedPostType,
            'selectedPostStatus' => $integrationDetails->selectedPostStatus,
            'selectedPost'       => $integrationDetails->selectedPost,
        ];

        $recordApiHelper = new VoxelService($integId);
        $voxelResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $selectedOptions);

        if (is_wp_error($voxelResponse)) {
            return $voxelResponse;
        }

        return $voxelResponse;
    }
}
