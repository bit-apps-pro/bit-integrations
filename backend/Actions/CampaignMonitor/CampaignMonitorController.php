<?php

namespace BitApps\Integrations\Actions\CampaignMonitor;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class CampaignMonitorController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'campaignmonitor',
        'fields'   => [
            'api_key'   => 'username',
            'client_id' => 'client_id',
        ],
    ];

    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = 'https://api.createsend.com/api/v3.3';
    }

    public function getAllLists($requestParams)
    {
        $this->checkValidation($requestParams->api_key, $requestParams->client_id);
        $headers = $this->setHeader($requestParams->api_key);
        $apiEndpoint = $this->baseUrl . "/clients/{$requestParams->client_id}/lists.json";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $lists = [];

        foreach ($apiResponse as $item) {
            $lists[] = [
                'listId'   => $item->ListID,
                'listName' => $item->Name
            ];
        }

        if ((\count($lists)) > 0) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error(__('Lists fetching failed', 'bit-integrations'), 400);
        }
    }

    public function getCustomFields($requestParams)
    {
        $this->checkValidation($requestParams->api_key, $requestParams->client_id, $requestParams->listId);
        $headers = $this->setHeader($requestParams->api_key);
        $apiEndpoint = $this->baseUrl . "/lists/{$requestParams->listId}/customfields.json";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $fields = [];

        foreach ($apiResponse as $field) {
            $fields[] = [
                'key'   => $field->Key,
                'label' => $field->FieldName
            ];
        }

        if (!isset($apiResponse->Code)) {
            wp_send_json_success($fields, 200);
        } else {
            // translators: %s: Placeholder value
            wp_send_json_error(wp_sprintf(__('Field fetching failed: %s', 'bit-integrations'), $apiResponse->Message), 400);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $selectedList = $integrationDetails->listId;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key;

        if (empty($fieldMap) || empty($apiKey) || empty($selectedList)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Campaign Monitor'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey);
        $campaignMonitorApiResponse = $recordApiHelper->execute(
            $selectedList,
            $fieldValues,
            $fieldMap,
            $actions
        );
        if (is_wp_error($campaignMonitorApiResponse) || !filter_var($campaignMonitorApiResponse, FILTER_VALIDATE_EMAIL)) {
            return $campaignMonitorApiResponse->Message;
        }

        return $campaignMonitorApiResponse;
    }

    private function setHeader($apiKey)
    {
        return [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
            'Accept'        => 'application/json'
        ];
    }

    private function checkValidation($apiKey, $clientId, $customParam = '**')
    {
        if (empty($apiKey) || empty($clientId) || empty($customParam)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }
    }
}
