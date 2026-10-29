<?php

namespace BitApps\Integrations\Actions\PerfexCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class PerfexCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'perfexcrm',
        'fields'   => [
            'api_token' => 'value',
            'domain'    => 'domain',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiToken = $integrationDetails->api_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $domain = $integrationDetails->domain;

        if (empty($fieldMap) || empty($apiToken) || empty($actionName) || empty($domain)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'PerfexCRM'));
        }

        $recordApiHelper = new PerfexCRMService($integrationDetails, $integId, $apiToken, $domain);
        $perfexCRMApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($perfexCRMApiResponse)) {
            return $perfexCRMApiResponse;
        }

        return $perfexCRMApiResponse;
    }
}
