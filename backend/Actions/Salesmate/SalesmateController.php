<?php

/**
 * Salesmate Integration
 */

namespace BitApps\Integrations\Actions\Salesmate;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Salesmate integration
 */
class SalesmateController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'salesmate',
        'fields'   => [
            'session_token' => 'value',
            'link_name'     => 'link_name',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    protected $linkName;

    public function getAllFields($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams, $fieldsRequestParams->action_id);
        $sessionToken = $fieldsRequestParams->session_token;
        $actionId = $fieldsRequestParams->action_id;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . "v1/modules/{$actionId}/fields";

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            $fieldMap = [];
            foreach ($response->Data as $module) {
                foreach ($module->Fields as $field) {
                    $fieldMap[]
                    = [
                        'key'      => $field->fieldName,
                        'label'    => $field->displayName,
                        'required' => $this->checkRequiredFields($actionId, $field->fieldName, $field->isRequired)
                    ]
                    ;
                }
            }

            wp_send_json_success($fieldMap, 200);
        } else {
            wp_send_json_error(__('Fields fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllTags($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $sessionToken = $fieldsRequestParams->session_token;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . 'v1/tags';

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            foreach ($response->Data as $tag) {
                $tags[] = [
                    'tag' => $tag->tag
                ];
            }
            wp_send_json_success($tags, 200);
        } else {
            wp_send_json_error(__('Tags fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCurrencies($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $sessionToken = $fieldsRequestParams->session_token;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . 'v3/lookups/active/currency';

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            foreach ($response->Data as $currency) {
                $currencies[] = [
                    'currency' => $currency->code
                ];
            }
            wp_send_json_success($currencies, 200);
        } else {
            wp_send_json_error(__('Currencies fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMPipelines($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $sessionToken = $fieldsRequestParams->session_token;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . 'v3/apps/dealPipeline';

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            foreach ($response->Data as $pipelines) {
                $CRMPipelines[] = [
                    'pipeline' => $pipelines->pipeline,
                    'stages'   => $pipelines->stages
                ];
            }
            wp_send_json_success($CRMPipelines, 200);
        } else {
            wp_send_json_error(__('Pipelines fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMContacts($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $sessionToken = $fieldsRequestParams->session_token;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . 'contact/v4/search';
        $body = '{"displayingFields":["contact.id","contact.name","contact.email"],"filterQuery":{"group":{"operator":"AND","rules":[{"moduleName":"Contact","field":{"fieldName":"contact.isDeleted","displayName":"Show Deleted","type":"Boolean"},"data":"false","eventType":"Boolean"}]}},"sort":[{"fieldName":"contact.createdAt","order":"desc"},{"fieldName":"contact.id","order":"desc"}],"moduleId":1,"reportType":"get_data","getRecordsCount":true}';

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::post($apiEndpoint, $body, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            foreach ($response->Data->data as $contact) {
                $CRMContacts[] = [
                    'id'    => $contact->id,
                    'name'  => $contact->name,
                    'email' => $contact->email
                ];
            }
            wp_send_json_success($CRMContacts, 200);
        } else {
            wp_send_json_error(__('Contacts fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMCompanies($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $sessionToken = $fieldsRequestParams->session_token;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . 'company/v4/search';
        $body = '{"displayingFields":["company.name","company.id"],"filterQuery":{"group":{"operator":"AND","rules":[{"condition":"IS_AFTER","moduleName":"Company","field":{"fieldName":"company.createdAt","displayName":"Created At","type":"DateTime"},"data":"Jan 01, 1970 05:30 AM","eventType":"DateTime"}]}},"sort":{"fieldName":"company.annualRevenue","order":"desc"},"moduleId":5,"reportType":"get_data","getRecordsCount":true}';

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::post($apiEndpoint, $body, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            foreach ($response->Data->data as $contact) {
                $CRMCompanies[] = [
                    'id'   => $contact->id,
                    'name' => $contact->name
                ];
            }
            wp_send_json_success($CRMCompanies, 200);
        } else {
            wp_send_json_error(__('Companies fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getAllCRMOwners($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $sessionToken = $fieldsRequestParams->session_token;
        $this->linkName = $fieldsRequestParams->link_name;
        $apiEndpoint = $this->setApiEndpoint() . 'v1/users/active';

        $headers = $this->setHeaders($sessionToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (isset($response->Status) && $response->Status === 'success') {
            foreach ($response->Data as $owner) {
                $CRMOwners[] = [
                    'id'   => $owner->id,
                    'name' => "{$owner->firstName} {$owner->lastName}"
                ];
            }
            wp_send_json_success($CRMOwners, 200);
        } else {
            wp_send_json_error(__('Owners fetching failed', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $sessionToken = $integrationDetails->session_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $actionId = $integrationDetails->actionId;
        $linkName = $integrationDetails->link_name;

        if (empty($fieldMap) || empty($sessionToken) || empty($actionName) || empty($actionId) || empty($linkName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Salesmate'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $sessionToken, $linkName);
        $salesmateApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionId);

        if (is_wp_error($salesmateApiResponse)) {
            return $salesmateApiResponse;
        }

        return $salesmateApiResponse;
    }

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = "https://{$this->linkName}.salesmate.io/apis/";
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->session_token) || empty($fieldsRequestParams->link_name) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($sessionToken)
    {
        return
            [
                'Content-type' => 'application/json',
                'accessToken'  => $sessionToken,
                'x-linkname'   => $this->linkName . '.salesmate.io',
            ];
    }

    private function checkRequiredFields($actionId, $fieldName, $isRequired)
    {
        $contact = ['lastName'];
        $deal = ['title'];
        $company = ['name'];
        $product = ['name', 'unitPrice'];

        if ((int) $actionId === 1) {
            if (stripos($fieldName, 'CustomField') > -1 && $isRequired) {
                return true;
            }

            return array_search($fieldName, $contact) > -1 ? true : false;
        } elseif ((int) $actionId === 4) {
            if (stripos($fieldName, 'CustomField') > -1 && $isRequired) {
                return true;
            }

            return array_search($fieldName, $deal) > -1 ? true : false;
        } elseif ((int) $actionId === 5) {
            if (stripos($fieldName, 'CustomField') > -1 && $isRequired) {
                return true;
            }

            return array_search($fieldName, $company) > -1 ? true : false;
        } elseif ((int) $actionId === 6) {
            if (stripos($fieldName, 'CustomField') > -1 && $isRequired) {
                return true;
            }

            return array_search($fieldName, $product) > -1 ? true : false;
        }
    }
}
