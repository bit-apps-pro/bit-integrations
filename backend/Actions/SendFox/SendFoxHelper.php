<?php

namespace BitApps\Integrations\Actions\SendFox;

use BitApps\Integrations\Core\Util\HttpHelper;

class SendFoxHelper
{
    private $baseUrl = 'https://api.sendfox.com/';

    public function fetchContactLists($requestParams)
    {
        if (empty($requestParams->access_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'lists?page=1&limit=1000';

        $requestParams = [
            'Authorization' => "Bearer {$requestParams->access_token}",
            'Accept'        => 'application/json',
        ];

        $response = HttpHelper::get($apiEndpoints, null, $requestParams);

        if ($response->message !== 'Unauthenticated.') {
            wp_send_json_success($response, 200);
        } else {
            wp_send_json_error(
                'The token is invalid',
                400
            );
        }
    }
}
