<?php

/**
 * Salesflare Integration
 */

namespace BitApps\Integrations\Actions\Salesflare;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Salesflare integration
 */
class SalesflareController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'salesflare',
        'fields'   => [
            'api_key' => 'token',
        ],
    ];

    protected $_defaultHeader;

    protected $apiEndpoint;

    protected $domain;

    public function customFields($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams, $fieldsRequestParams->action_name);
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->setApiEndpoint() . "/customfields/{$fieldsRequestParams->action_name}";
        $headers = $this->setHeaders($apiKey);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!isset($response->error)) {
            $fieldMap = [];
            foreach ($response as $field) {
                $fieldMap[]
                = (object) [
                    'key'      => "custom_field_{$field->api_field}",
                    'label'    => $field->name,
                    'required' => $field->required
                ]
                ;
            }

            wp_send_json_success($fieldMap, 200);
        } else {
            wp_send_json_error('Custom fields not found!', 400);
        }
    }

    public function getAllTags($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->setApiEndpoint() . '/tags';
        $headers = $this->setHeaders($apiKey);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!isset($response->error)) {
            $tags = [];
            foreach ($response as $tag) {
                $tags[] = $tag->name;
            }

            wp_send_json_success($tags, 200);
        } else {
            wp_send_json_error(__('Tags fetching failed!', 'bit-integrations'), 400);
        }
    }

    public function getAllAccounts($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->setApiEndpoint() . '/accounts';
        $headers = $this->setHeaders($apiKey);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!isset($response->error)) {
            $accounts = [];
            foreach ($response as $account) {
                $accounts[]
                = (object) [
                    'id'   => $account->id,
                    'name' => $account->name,
                ]
                ;
            }

            wp_send_json_success($accounts, 200);
        } else {
            wp_send_json_error(__('Accounts fetching failed!', 'bit-integrations'), 400);
        }
    }

    public function getAllPipelines($fieldsRequestParams)
    {
        $this->checkValidation($fieldsRequestParams);
        $apiKey = $fieldsRequestParams->api_key;
        $apiEndpoint = $this->setApiEndpoint() . '/pipelines';
        $headers = $this->setHeaders($apiKey);
        $response = HttpHelper::get($apiEndpoint, null, $headers);

        if (!isset($response->error)) {
            $pipelines = [];
            foreach ($response as $pipeline) {
                $pipelines[]
                = (object) [
                    'id'     => $pipeline->id,
                    'name'   => $pipeline->name,
                    'stages' => $pipeline->stages,
                ]
                ;
            }

            wp_send_json_success($pipelines, 200);
        } else {
            wp_send_json_error(__('Accounts fetching failed!', 'bit-integrations'), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($apiKey) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Salesflare'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey);
        $salesflareApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($salesflareApiResponse)) {
            return $salesflareApiResponse;
        }

        return $salesflareApiResponse;
    }

    private function setApiEndpoint()
    {
        return $this->apiEndpoint = 'https://api.salesflare.com';
    }

    private function checkValidation($fieldsRequestParams, $customParam = '**')
    {
        if (empty($fieldsRequestParams->api_key) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }

    private function setHeaders($apiKey)
    {
        return
            [
                'Authorization' => "Bearer {$apiKey}",
                'Content-type'  => 'application/json',
            ];
    }
}
