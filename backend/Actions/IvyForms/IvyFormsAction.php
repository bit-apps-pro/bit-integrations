<?php

namespace BitApps\Integrations\Actions\IvyForms;

use WP_Error;

class IvyFormsAction
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

        return (new IvyFormsService($integrationDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
