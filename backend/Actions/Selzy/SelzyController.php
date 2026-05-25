<?php

/**
 * Selzy Integration
 */

namespace BitApps\Integrations\Actions\Selzy;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Selzy integration
 */
class SelzyController
{
    private $baseUrl = 'https://api.selzy.com/en/api/';

    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'selzy',
        'fields'   => [
            'authKey' => 'value',
            'api_key' => 'value',
        ],
    ];

    public function getAllLists($requestParams)
    {
        $apiKey = $this->resolveApiKey($requestParams);
        if (empty($apiKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'getLists?format=json&api_key=' . $apiKey;
        $response = HttpHelper::get($apiEndpoints, null);
        if ($response->code === 'invalid_api_key') {
            wp_send_json_error(
                __(
                    'Invalid token',
                    'bit-integrations'
                ),
                400
            );
        }
        wp_send_json_success($response, 200);
    }

    public function getAllTags($requestParams)
    {
        $apiKey = $this->resolveApiKey($requestParams);
        if (empty($apiKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'getTags?format=json&api_key=' . $apiKey;
        $response = HttpHelper::get($apiEndpoints, null);
        if ($response->code === 'invalid_api_key') {
            wp_send_json_error(
                __(
                    'Invalid token',
                    'bit-integrations'
                ),
                400
            );
        }
        wp_send_json_success($response, 200);
    }

    public function getAllCustomFields($requestParams)
    {
        $apiKey = $this->resolveApiKey($requestParams);
        if (empty($apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoint = "https://api.selzy.com/en/api/getFields?format=json&api_key={$apiKey}";

        $response = HttpHelper::get($apiEndpoint, null);

        if ($response->code === 'invalid_api_key') {
            wp_send_json_error(__('Invalid token', 'bit-integrations'), 400);
        }

        if (!empty($response->result)) {
            foreach ($response->result as $customField) {
                $customFields[] = [
                    'key'      => $customField->name,
                    'label'    => $customField->name,
                    'required' => false
                ];
            }
            wp_send_json_success($customFields, 200);
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = $integrationDetails->authKey ?: ($integrationDetails->api_key ?: ($integrationDetails->value ?? ''));
        $listIds = $integrationDetails->listIds;
        $tags = $integrationDetails->tags;
        $method = $integrationDetails->method;
        $option = $integrationDetails->option;
        $overwrite = $integrationDetails->overwrite;
        $field_map = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;

        if (!$actions->option) {
            $option = 0;
        }
        if (!$actions->overwrite) {
            $overwrite = 0;
        }

        if (
            empty($field_map)
            || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Selzy'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $selzyApiResponse = $recordApiHelper->execute(
            $method,
            $listIds,
            $tags,
            $option,
            $overwrite,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($selzyApiResponse)) {
            return $selzyApiResponse;
        }

        return $selzyApiResponse;
    }

    private function resolveApiKey($requestParams)
    {
        return $requestParams->authKey ?: ($requestParams->api_key ?: ($requestParams->value ?? ''));
    }
}
