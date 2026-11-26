<?php

namespace BitApps\Integrations\Actions\UltimateAffiliatePro;

use WP_Error;

class UltimateAffiliateProAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new UltimateAffiliateProService($integrationDetails, $integId);
        $response = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($response)) {
            return $response;
        }

        return $response;
    }
}
