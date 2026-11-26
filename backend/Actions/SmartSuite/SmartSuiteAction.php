<?php

namespace BitApps\Integrations\Actions\SmartSuite;

use BitApps\Integrations\Authorization\AuthorizationType;

class SmartSuiteAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'smartsuite',
        'fields'   => [
            'apiToken'    => 'value',
            'workspaceId' => 'workspaceId',
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://app.smartsuite.com/api/v1/';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $workspaceId = $integrationDetails->workspaceId;
        $apiToken = $integrationDetails->apiToken;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $recordApiHelper = new SmartSuiteService($integrationDetails, $integId, $workspaceId, $apiToken);
        $smartSuiteApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($smartSuiteApiResponse)) {
            return $smartSuiteApiResponse;
        }

        return $smartSuiteApiResponse;
    }
}
