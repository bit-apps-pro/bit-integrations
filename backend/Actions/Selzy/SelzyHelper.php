<?php

/**
 * Selzy Integration
 */

namespace BitApps\Integrations\Actions\Selzy;

use BitApps\Integrations\Core\Util\HttpHelper;

class SelzyHelper
{
    private $baseUrl = 'https://api.selzy.com/en/api/';

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

    private function resolveApiKey($requestParams)
    {
        return $requestParams->authKey ?: ($requestParams->api_key ?: ($requestParams->value ?? ''));
    }
}
