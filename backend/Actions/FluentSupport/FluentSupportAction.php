<?php

namespace BitApps\Integrations\Actions\FluentSupport;

use WP_Error;

class FluentSupportAction
{
    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($integrationDetails)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('module, required fields are empty', 'bit-integrations'));
        }
        $recordApiHelper = new FluentSupportService($integrationId);
        $fluentSupportApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );

        if (is_wp_error($fluentSupportApiResponse)) {
            return $fluentSupportApiResponse;
        }

        return $fluentSupportApiResponse;
    }
}
