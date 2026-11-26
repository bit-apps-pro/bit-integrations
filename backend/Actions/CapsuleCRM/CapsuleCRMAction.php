<?php

namespace BitApps\Integrations\Actions\CapsuleCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class CapsuleCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'capsulecrm',
        'fields'   => [
            'api_key' => 'token',
            'api_url' => 'api_url',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api.capsulecrm.com/api/v2';
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
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Capsule CRM'));
        }

        $recordApiHelper = new CapsuleCRMService($integrationDetails, $integId);
        $capsulecrmApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($capsulecrmApiResponse)) {
            return $capsulecrmApiResponse;
        }

        return $capsulecrmApiResponse;
    }
}
