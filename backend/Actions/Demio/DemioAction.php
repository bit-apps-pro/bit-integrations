<?php

namespace BitApps\Integrations\Actions\Demio;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class DemioAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'demio',
        'fields'   => [
            'api_key'    => 'value',
            'api_secret' => 'api_secret',
        ],
    ];

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://my.demio.com/api/v1';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $apiSecret = $integrationDetails->api_secret;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($apiSecret) || empty($actionName) || empty($apiKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Demio'));
        }

        $recordApiHelper = new DemioService($integrationDetails, $integId, $apiSecret, $apiKey);
        $demioApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($demioApiResponse)) {
            return $demioApiResponse;
        }

        return $demioApiResponse;
    }
}
