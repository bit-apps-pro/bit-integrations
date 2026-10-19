<?php

namespace BitApps\Integrations\Actions\OneHashCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class OneHashCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'onehashcrm',
        'fields'   => [
            'api_key'    => 'value',
            'api_secret' => 'api_secret',
            'domain'     => 'domain',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $apiSecret = $integrationDetails->api_secret;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $domain = $integrationDetails->domain;

        if (empty($fieldMap) || empty($apiKey) || empty($apiSecret) || empty($actionName) || empty($domain)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'OneHashCRM'));
        }

        $recordApiHelper = new OneHashCRMService($integrationDetails, $integId, $apiKey, $apiSecret, $domain);
        $oneHashCRMApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($oneHashCRMApiResponse)) {
            return $oneHashCRMApiResponse;
        }

        return $oneHashCRMApiResponse;
    }
}
