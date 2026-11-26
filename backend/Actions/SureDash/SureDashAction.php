<?php

namespace BitApps\Integrations\Actions\SureDash;

use WP_Error;

class SureDashAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new SureDashService($integrationDetails, $integId);
        $sureDashResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($sureDashResponse)) {
            return $sureDashResponse;
        }

        return $sureDashResponse;
    }
}
