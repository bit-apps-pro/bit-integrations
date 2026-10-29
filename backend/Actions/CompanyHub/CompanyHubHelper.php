<?php

namespace BitApps\Integrations\Actions\CompanyHub;

use BitApps\Integrations\Core\Util\HttpHelper;

class CompanyHubHelper
{
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
