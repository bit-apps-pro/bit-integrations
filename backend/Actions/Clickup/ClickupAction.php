<?php

namespace BitApps\Integrations\Actions\Clickup;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class ClickupAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'clickup',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api.clickup.com/api/v2/';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Clickup'));
        }

        $recordApiHelper = new ClickupService($integrationDetails, $integId);
        $clickupApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($clickupApiResponse)) {
            return $clickupApiResponse;
        }

        return $clickupApiResponse;
    }
}
