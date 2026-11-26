<?php

namespace BitApps\Integrations\Actions\Groundhogg;

use BitApps\Integrations\Core\Util\HttpHelper;

class GroundhoggHelper
{
    public static function groundhoggFetchAllTags($requestParams)
    {
        if (
            empty($requestParams->public_key) || empty($requestParams->token)
            || empty($requestParams->domainName)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $authorizationHeader = [
            'Gh-Token'      => $requestParams->token,
            'Gh-Public-Key' => $requestParams->public_key
        ];

        $apiEndpoint = $requestParams->domainName . '/index.php?rest_route=/gh/v3/tags';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        if ($apiResponse->status === 'success') {
            wp_send_json_success($apiResponse, 200);
        } else {
            wp_send_json_error(
                'There is an error .',
                400
            );
        }
    }
}
