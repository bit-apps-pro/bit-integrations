<?php

namespace BitApps\Integrations\Actions\Nimble;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class NimbleAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'nimble',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://app.nimble.com/api/v1';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = !empty($integrationDetails->api_key) ? $integrationDetails->api_key : (isset($integrationDetails->value) ? $integrationDetails->value : '');
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($apiKey) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Nimble'));
        }

        $recordApiHelper = new NimbleService($integrationDetails, $integId, $apiKey);
        $nimbleApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($nimbleApiResponse)) {
            return $nimbleApiResponse;
        }

        return $nimbleApiResponse;
    }
}
