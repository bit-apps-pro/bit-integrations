<?php

namespace BitApps\Integrations\Actions\Salesflare;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SalesflareAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'salesflare',
        'fields'   => [
            'api_key' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($apiKey) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Salesflare'));
        }

        $recordApiHelper = new SalesflareService($integrationDetails, $integId, $apiKey);
        $salesflareApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($salesflareApiResponse)) {
            return $salesflareApiResponse;
        }

        return $salesflareApiResponse;
    }
}
