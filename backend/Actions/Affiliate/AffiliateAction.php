<?php

namespace BitApps\Integrations\Actions\Affiliate;

use WP_Error;

class AffiliateAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        if (
            empty($integId)
            || empty($mainAction) || empty($fieldMap)
        ) {
            // translators: %s: Integration name
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Affiliate api'));
        }
        $recordApiHelper = new AffiliateService($integrationDetails, $integId);
        $affiliateApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($affiliateApiResponse)) {
            return $affiliateApiResponse;
        }

        return $affiliateApiResponse;
    }
}
