<?php

/**
 * CompanyHub Integration
 */

namespace BitApps\Integrations\Actions\CompanyHub;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for CompanyHub integration
 */
class CompanyHubController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'companyhub',
        'fields'   => [
            'api_key'    => 'value',
            'sub_domain' => 'sub_domain',
        ],
    ];

    protected $_defaultHeader;

    protected $_apiEndpoint;

    public function __construct()
    {
        $this->_apiEndpoint = 'https://api.companyhub.com/v1';
    }

    public function getAllCompanies($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->sub_domain, $fieldsRequestParams->api_key);
        $apiEndpoint = $this->_apiEndpoint . '/tables/company';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (!isset($response->success)) {
            $companies = [];
            foreach ($response->Data as $company) {
                $companies[]
                = (object) [
                    'id'   => $company->ID,
                    'name' => $company->Name
                ]
                ;
            }
            wp_send_json_success($companies, 200);
        } else {
            wp_send_json_error(__('Companies fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllContacts($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->setHeaders($fieldsRequestParams->sub_domain, $fieldsRequestParams->api_key);
        $apiEndpoint = $this->_apiEndpoint . '/tables/contact';
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        if (!isset($response->success)) {
            $contacts = [];
            foreach ($response->Data as $company) {
                $contacts[]
                = (object) [
                    'id'   => $company->ID,
                    'name' => $company->Name
                ]
                ;
            }
            wp_send_json_success($contacts, 200);
        } else {
            wp_send_json_error(__('Contacts fetching failed', 'bit-integrations'), 400);
        }
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

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $subDomain, $apiKey);
        $companyHubApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($companyHubApiResponse)) {
            return $companyHubApiResponse;
        }

        return $companyHubApiResponse;
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->sub_domain) || empty($fieldsRequestParams->api_key) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($subDomain, $apiKey)
    {
        $this->_defaultHeader = [
            'Authorization' => "{$subDomain} {$apiKey}",
            'Content-Type'  => 'application/json'
        ];
    }
}
