<?php

namespace BitApps\Integrations\Actions\GamiPress;

use WP_Error;

class GamiPressAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            return new WP_Error('REQ_FIELD_EMPTY', __('module, select action are require for GamiPress api', 'bit-integrations'));
        }
        $recordApiHelper = new GamiPressService($integrationDetails, $integId);
        $gamiPressApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData,
            $fieldMap
        );

        if (is_wp_error($gamiPressApiResponse)) {
            return $gamiPressApiResponse;
        }

        return $gamiPressApiResponse;
    }
}
