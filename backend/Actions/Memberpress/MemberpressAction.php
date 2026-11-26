<?php

namespace BitApps\Integrations\Actions\Memberpress;

use WP_Error;

class MemberpressAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        $selectedMembership = $integrationDetails->selectedMembership;
        if (
            empty($integId)
            || empty($mainAction) || empty($selectedMembership)
        ) {
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'memberpress'));
        }
        $recordApiHelper = new MemberpressService($integrationDetails, $integId);
        $memberpressApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($memberpressApiResponse)) {
            return $memberpressApiResponse;
        }

        return $memberpressApiResponse;
    }
}
