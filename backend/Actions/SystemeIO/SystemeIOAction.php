<?php

namespace BitApps\Integrations\Actions\SystemeIO;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SystemeIOAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'systemeio',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://api.systeme.io/api';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($actionName) || empty($apiKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'SystemeIO'));
        }

        $recordApiHelper = new SystemeIOService($integrationDetails, $integId, $apiKey);
        $systemeIOApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($systemeIOApiResponse)) {
            return $systemeIOApiResponse;
        }

        return $systemeIOApiResponse;
    }
}
