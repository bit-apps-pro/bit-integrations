<?php

namespace BitApps\Integrations\Actions\Fabman;

use BitApps\Integrations\Core\Util\HttpHelper;

class FabmanHelper
{
    public static function fetchAccountId($requestParams)
    {
        if (empty($requestParams->apiKey)) {
            wp_send_json_error(__('API Key is required', 'bit-integrations'), 400);
        }

        $header = [
            'Authorization' => 'Bearer ' . $requestParams->apiKey,
            'Content-Type'  => 'application/json'
        ];

        $apiEndpoint = 'https://fabman.io/api/v1/accounts';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (is_wp_error($apiResponse)) {
            wp_send_json_error($apiResponse->get_error_message(), 400);
        }

        if (empty($apiResponse) || isset($apiResponse->error) || !\is_array($apiResponse) || !isset($apiResponse[0]->id)) {
            wp_send_json_error(isset($apiResponse->error) ? $apiResponse->error : __('Invalid API credentials', 'bit-integrations'), 400);
        }

        $accountId = $apiResponse[0]->id;
        wp_send_json_success([
            'accountId' => $accountId
        ], 200);
    }

    public static function fetchWorkspaces($requestParams)
    {
        if (empty($requestParams->apiKey)) {
            wp_send_json_error(__('API Key is required', 'bit-integrations'), 400);
        }

        $header = [
            'Authorization' => 'Bearer ' . $requestParams->apiKey,
            'Content-Type'  => 'application/json'
        ];

        $apiEndpoint = 'https://fabman.io/api/v1/spaces';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (is_wp_error($apiResponse)) {
            wp_send_json_error($apiResponse->get_error_message(), 400);
        }

        if (empty($apiResponse) || isset($apiResponse->error) || !\is_array($apiResponse)) {
            wp_send_json_error(isset($apiResponse->error) ? $apiResponse->error : __('Failed to fetch workspaces', 'bit-integrations'), 400);
        }

        wp_send_json_success([
            'workspaces' => $apiResponse
        ], 200);
    }
}
