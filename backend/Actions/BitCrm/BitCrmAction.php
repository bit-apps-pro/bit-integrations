<?php

namespace BitApps\Integrations\Actions\BitCrm;

use WP_Error;

class BitCrmAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new BitCrmService($integrationDetails, $integId))->execute($fieldValues, $fieldMap);
    }
}
