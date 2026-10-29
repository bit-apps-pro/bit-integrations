<?php

namespace BitApps\Integrations\Actions\Insightly;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class InsightlyAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'insightly',
        'fields'   => [
            'api_key' => 'username',
            'api_url' => 'api_url',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Insightly'));
        }

        $recordApiHelper = new InsightlyService($integrationDetails, $integId);
        $insightlyApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($insightlyApiResponse)) {
            return $insightlyApiResponse;
        }

        return $insightlyApiResponse;
    }
}
