<?php

namespace BitApps\Integrations\Actions\CompanyHub;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class CompanyHubAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'companyhub',
        'fields'   => [
            'api_key'    => 'value',
            'sub_domain' => 'sub_domain',
        ],
    ];

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://api.companyhub.com/v1';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $subDomain = $integrationDetails->sub_domain;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($subDomain) || empty($actionName) || empty($apiKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Company Hub'));
        }

        $recordApiHelper = new CompanyHubService($integrationDetails, $integId, $subDomain, $apiKey);
        $companyHubApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($companyHubApiResponse)) {
            return $companyHubApiResponse;
        }

        return $companyHubApiResponse;
    }
}
