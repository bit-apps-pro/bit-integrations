<?php

namespace BitApps\Integrations\Actions\ElasticEmail;

use BitApps\Integrations\Core\Util\HttpHelper;

class ElasticEmailHelper
{
    public static function getAllLists($requestsParams)
    {
        $apiKey = $requestsParams->apiKey ?? $requestsParams->api_key ?? null;
        if (empty($apiKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = 'https://api.elasticemail.com/v4/lists';
        $header = [
            'X-ElasticEmail-ApiKey' => $apiKey,
            'Accept'                => '*/*',
        ];
        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);
        $data = [];
        foreach ($apiResponse as $list) {
            $data[] = (object) [
                'listId'   => $list->PublicListID,
                'listName' => $list->ListName
            ];
        }
        $response['lists'] = $data;
        wp_send_json_success($response, 200);
    }
}
