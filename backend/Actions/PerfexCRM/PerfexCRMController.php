<?php

/**
 * PerfexCRM Integration
 */

namespace BitApps\Integrations\Actions\PerfexCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for PerfexCRM integration
 */
class PerfexCRMController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'perfexcrm',
        'fields'   => [
            'api_token' => 'value',
            'domain'    => 'domain',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    protected $domain;

    public function getCustomFields($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams, $fieldsRequestParams->action_name);
        $this->domain = $fieldsRequestParams->domain;
        $apiToken = $fieldsRequestParams->api_token;

        switch ($fieldsRequestParams->action_name) {
            case 'customer':
                $actionName = 'customers';

                break;
            case 'contact':
                $actionName = 'contacts';

                break;
            case 'lead':
                $actionName = 'leads';

                break;
            case 'project':
                $actionName = 'projects';

                break;

            default:
                $actionName = '';

                break;
        }

        $apiEndpoint = $this->setApiEndpoint() . "/custom_fields/{$actionName}";
        $headers = $this->setHeaders($apiToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (\is_string($response) || isset($response->errors) || (isset($response->status) && !$response->status)) {
            wp_send_json_error(\is_string($response) ? $response : (!empty($response->message) ? $response->message : 'Custom Fields fetching failed'), 400);
        } else {
            $fieldMap = [];
            foreach ($response as $field) {
                $fieldMap[]
                = (object) [
                    'key'      => $field->field_name,
                    'label'    => $field->label,
                    'required' => $field->required === '1' ? true : false
                ]
                ;
            }
            wp_send_json_success($fieldMap, 200);
        }
    }

    public function getAllCustomer($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->domain = $fieldsRequestParams->domain;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint() . '/customers';
        $headers = $this->setHeaders($apiToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (\is_string($response) || isset($response->errors) || (isset($response->status) && !$response->status)) {
            wp_send_json_error(\is_string($response) ? $response : (!empty($response->message) ? $response->message : 'Customer fetching failed'), 400);
        } else {
            $customers = [];
            foreach ($response as $customer) {
                $customers[] = (object) [
                    'id'   => $customer->userid,
                    'name' => $customer->company
                ];
            }
            wp_send_json_success($customers, 200);
        }
    }

    public function getAllLead($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->domain = $fieldsRequestParams->domain;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint() . '/leads';
        $headers = $this->setHeaders($apiToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (\is_string($response) || isset($response->errors) || (isset($response->status) && !$response->status)) {
            wp_send_json_error(\is_string($response) ? $response : (!empty($response->message) ? $response->message : 'Lead fetching failed'), 400);
        } else {
            $leads = [];
            foreach ($response as $lead) {
                $leads[]
                = (object) [
                    'id'   => $lead->id,
                    'name' => $lead->name
                ]
                ;
            }
            wp_send_json_success($leads, 200);
        }
    }

    public function getAllStaff($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $this->domain = $fieldsRequestParams->domain;
        $apiToken = $fieldsRequestParams->api_token;
        $apiEndpoint = $this->setApiEndpoint() . '/staffs';
        $headers = $this->setHeaders($apiToken);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (\is_string($response) || isset($response->errors) || (isset($response->status) && !$response->status)) {
            wp_send_json_error(\is_string($response) ? $response : (!empty($response->message) ? $response->message : 'Project Member fetching failed'), 400);
        } else {
            $staffs = [];
            foreach ($response as $staff) {
                $staffs[]
                = (object) [
                    'id'   => $staff->staffid,
                    'name' => "{$staff->firstname} {$staff->lastname}"
                ]
                ;
            }
            wp_send_json_success($staffs, 200);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiToken = $integrationDetails->api_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $domain = $integrationDetails->domain;

        if (empty($fieldMap) || empty($apiToken) || empty($actionName) || empty($domain)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'PerfexCRM'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiToken, $domain);
        $perfexCRMApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($perfexCRMApiResponse)) {
            return $perfexCRMApiResponse;
        }

        return $perfexCRMApiResponse;
    }

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = "{$this->domain}/api";
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_token) || empty($fieldsRequestParams->domain) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiToken)
    {
        return
            [
                'authtoken'    => $apiToken,
                'Content-type' => 'application/json',
            ];
    }
}
