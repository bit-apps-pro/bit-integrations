<?php

namespace BitApps\Integrations\Actions\LifterLms;

use WP_Error;

class LifterLmsAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('Some important info are missing those are required for %s', 'bit-integrations'), 'LifterLms'));
        }
        $recordApiHelper = new LifterLmsService($integrationDetails, $integId);
        $lifterLmsApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($lifterLmsApiResponse)) {
            return $lifterLmsApiResponse;
        }

        return $lifterLmsApiResponse;
    }
}
