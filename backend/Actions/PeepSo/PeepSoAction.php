<?php

/**
 * PeepSo Integration
 */

namespace BitApps\Integrations\Actions\PeepSo;

use WP_Error;

class PeepSoAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new PeepSoService($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
