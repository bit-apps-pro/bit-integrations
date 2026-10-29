<?php

namespace BitApps\Integrations\Actions\Klaviyo;

use BitApps\Integrations\Core\Util\HttpHelper;

class KlaviyoHelper
{
    private $baseUrl = 'https://a.klaviyo.com/api/';

    public function getAllLists($requestParams)
    {
        if (empty($requestParams->authKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $response = static::fetchLists($requestParams->authKey, $this->baseUrl . 'lists');

        if (empty($response)) {
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

    private static function fetchLists($authKey, $apiEndpoints, $data = [])
    {
        $headers = [
            'Authorization' => "Klaviyo-API-Key {$authKey}",
            'accept'        => 'application/json',
            'revision'      => '2024-02-15',
        ];

        $response = HttpHelper::get($apiEndpoints, null, $headers);

        if (is_wp_error($response) || empty($response->data)) {
            return $data;
        }

        $data = array_merge($data, $response->data);

        if (!empty($response->links->next)) {
            return static::fetchLists($authKey, $response->links->next, $data);
        }

        return $data;
    }
}
