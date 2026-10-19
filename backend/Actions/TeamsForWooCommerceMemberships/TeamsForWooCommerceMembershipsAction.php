<?php

namespace BitApps\Integrations\Actions\TeamsForWooCommerceMemberships;

use WP_Error;

class TeamsForWooCommerceMembershipsAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new TeamsForWooCommerceMembershipsService($integrationDetails, $integId);
        $teamsForWooCommerceMembershipsResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $mainAction);

        if (is_wp_error($teamsForWooCommerceMembershipsResponse)) {
            return $teamsForWooCommerceMembershipsResponse;
        }

        return $teamsForWooCommerceMembershipsResponse;
    }
}
