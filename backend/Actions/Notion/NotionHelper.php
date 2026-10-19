<?php

namespace BitApps\Integrations\Actions\Notion;

use BitApps\Integrations\Core\Util\HttpHelper;

class NotionHelper
{
    private $baseurl = 'https://api.notion.com/v1/';

    public function getAllDatabaseLists($requestParams)
    {
        $accessToken = $requestParams->accessToken
            ?? ($requestParams->tokenDetails->access_token ?? ($requestParams->access_token ?? ''));

        if (empty($accessToken)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = "{$this->baseurl}search";
        $headers = [
            'Authorization'  => 'Bearer ' . $accessToken,
            'Notion-Version' => '2021-08-16'
        ];
        $response = HttpHelper::post($apiEndpoints, null, $headers);
        if ($response->Error !== null) {
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

    public function getFieldsProperties($requestParams)
    {
        $accessToken = $requestParams->accessToken
            ?? ($requestParams->tokenDetails->access_token ?? ($requestParams->access_token ?? ''));

        if (empty($accessToken)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = "{$this->baseurl}databases/{$requestParams->databaseId}";
        $headers = [
            'Authorization'  => 'Bearer ' . $accessToken,
            'Notion-Version' => '2021-08-16'
        ];
        $response = HttpHelper::get($apiEndpoints, null, $headers);
        if ($response->Error !== null) {
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
}
