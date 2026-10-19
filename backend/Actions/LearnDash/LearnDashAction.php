<?php

namespace BitApps\Integrations\Actions\LearnDash;

use WP_Error;

class LearnDashAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $mainActionGroupLeaderMail = isset($integrationDetails->learnDashConf->mainAction) ? $integrationDetails->learnDashConf->mainAction : '';
        if (!empty($mainActionGroupLeaderMail)) {
            $mainAction = $mainActionGroupLeaderMail;
        }

        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'LearnDash'));
        }
        $recordApiHelper = new LearnDashService($integrationDetails, $integId);
        $learnDashApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($learnDashApiResponse)) {
            return $learnDashApiResponse;
        }

        return $learnDashApiResponse;
    }
}
