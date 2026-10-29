<?php

namespace BitApps\Integrations\Actions\B2BKing;

use WP_Error;

class B2BKingAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : (object) [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new B2BKingService($integrationDetails, $integId);
        $b2bKingResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);

        if (is_wp_error($b2bKingResponse)) {
            return $b2bKingResponse;
        }

        return $b2bKingResponse;
    }
}
