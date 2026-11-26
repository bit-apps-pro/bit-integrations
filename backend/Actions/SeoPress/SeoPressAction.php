<?php

namespace BitApps\Integrations\Actions\SeoPress;

use WP_Error;

class SeoPressAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new SeoPressService($integrationDetails, $integId);
        $seoPressResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($seoPressResponse)) {
            return $seoPressResponse;
        }

        return $seoPressResponse;
    }
}
