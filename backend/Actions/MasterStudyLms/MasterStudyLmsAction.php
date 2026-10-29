<?php

namespace BitApps\Integrations\Actions\MasterStudyLms;

use WP_Error;

class MasterStudyLmsAction
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
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('Some important info are missing those are required for %s', 'bit-integrations'), 'MasterStudyLms'));
        }
        $recordApiHelper = new MasterStudyLmsService($integrationDetails, $integId);
        $MasterStudyLmsApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($MasterStudyLmsApiResponse)) {
            return $MasterStudyLmsApiResponse;
        }

        return $MasterStudyLmsApiResponse;
    }
}
