<?php

/**
 * NutshellCRM Integration
 */

namespace BitApps\Integrations\Actions\NutshellCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for NutshellCRM integration
 */
class NutshellCRMController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'nutshellcrm',
        'fields'   => [
            'user_name' => 'username',
            'api_token' => 'password',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    public function getCompanies($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->user_name || $fieldsRequestParams->api_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $userName = $fieldsRequestParams->user_name;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint();
        $headers = $this->setHeaders($userName, $apiToken);
        $body = [
            'method' => 'findAccounts',
            'id'     => 'randomstring',
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);

        if (isset($response->result)) {
            foreach ($response->result as $company) {
                $companies[] = [
                    'id'   => (string) $company->id,
                    'name' => $company->name
                ];
            }
            wp_send_json_success($companies, 200);
        } else {
            wp_send_json_error(__('Contacts fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getContacts($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->user_name || $fieldsRequestParams->api_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $userName = $fieldsRequestParams->user_name;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint();
        $headers = $this->setHeaders($userName, $apiToken);
        $body = [
            'method' => 'findContacts',
            'id'     => 'randomstring',
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);

        if (isset($response->result)) {
            foreach ($response->result as $contact) {
                $contacts[] = [
                    'id'   => (string) $contact->id,
                    'name' => $contact->name
                ];
            }
            wp_send_json_success($contacts, 200);
        } else {
            wp_send_json_error(__('Contacts fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getProducts($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->user_name || $fieldsRequestParams->api_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $userName = $fieldsRequestParams->user_name;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint();
        $headers = $this->setHeaders($userName, $apiToken);
        $body = [
            'method' => 'findProducts',
            'id'     => 'randomstring',
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);

        if (isset($response->result)) {
            foreach ($response->result as $product) {
                $products[] = [
                    'id'   => (string) $product->id,
                    'name' => $product->name
                ];
            }
            wp_send_json_success($products, 200);
        } else {
            wp_send_json_error(__('Products fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getSources($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->user_name || $fieldsRequestParams->api_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $userName = $fieldsRequestParams->user_name;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint();
        $headers = $this->setHeaders($userName, $apiToken);
        $body = [
            'method' => 'findSources',
            'id'     => 'randomstring',
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);

        if (isset($response->result)) {
            foreach ($response->result as $source) {
                $sources[] = [
                    'id'   => (string) $source->id,
                    'name' => $source->name
                ];
            }
            wp_send_json_success($sources, 200);
        } else {
            wp_send_json_error(__('Sources fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getTags($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->user_name || $fieldsRequestParams->api_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $userName = $fieldsRequestParams->user_name;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint();
        $headers = $this->setHeaders($userName, $apiToken);
        $body = [
            'method' => 'findTags',
            'id'     => 'randomstring',
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);

        if (isset($response->result)) {
            foreach ($response->result->Leads as $tag) {
                $tags[] = [
                    'id'   => (string) $tag,
                    'name' => $tag
                ];
            }
            wp_send_json_success($tags, 200);
        } else {
            wp_send_json_error(__('Tags fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getCompanyTypes($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->user_name || $fieldsRequestParams->api_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $userName = $fieldsRequestParams->user_name;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint();
        $headers = $this->setHeaders($userName, $apiToken);
        $body = [
            'method' => 'findAccountTypes',
            'id'     => 'randomstring',
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($body), $headers);

        if (isset($response->result)) {
            foreach ($response->result as $companyType) {
                $companyTypes[] = [
                    'id'   => (string) $companyType->id,
                    'name' => $companyType->name
                ];
            }
            wp_send_json_success($companyTypes, 200);
        } else {
            wp_send_json_error(__('CompanyTypes fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $userName = $integrationDetails->user_name;
        $apiToken = $integrationDetails->api_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($userName) || empty($apiToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'NutshellCRM'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $userName, $apiToken);
        $nutshellCRMApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($nutshellCRMApiResponse)) {
            return $nutshellCRMApiResponse;
        }

        return $nutshellCRMApiResponse;
    }

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = 'https://app.nutshell.com/api/v1/json';
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->user_name) || empty($fieldsRequestParams->api_token) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($userName, $apiToken)
    {
        return
            [
                'Authorization' => 'Basic ' . base64_encode("{$userName}:{$apiToken}"),
                'Content-type'  => 'application/json',
            ];
    }
}
