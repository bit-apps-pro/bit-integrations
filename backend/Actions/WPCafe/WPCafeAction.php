<?php

namespace BitApps\Integrations\Actions\WPCafe;

use WP_Error;

class WPCafeAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new WPCafeService($integrationDetails, $integId);
        $wpcafeResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($wpcafeResponse)) {
            return $wpcafeResponse;
        }

        return $wpcafeResponse;
    }
}
