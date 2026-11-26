<?php

namespace BitApps\Integrations\Actions\Sendy;

use BitApps\Integrations\Core\Util\HttpHelper;

class SendyHelper
{
    public function getAllBrands($queryParams)
    {
        $apiKey = $queryParams->api_key ?: ($queryParams->value ?? '');
        $sendy_url = $queryParams->sendy_url ?? '';

        if (
            empty($apiKey)
            || empty($sendy_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoint = "{$sendy_url}/api/brands/get-brands.php";
        $authorizationHeader['Accept'] = 'application/json';
        $requestsParams = [
            'api_key' => $apiKey
        ];
        $apiResponse = HttpHelper::post($apiEndpoint, $requestsParams, $authorizationHeader);
        $response = [];
        foreach ($apiResponse as $list) {
            $response[] = (object) [
                'brandId'   => $list->id,
                'brandName' => $list->name
            ];
        }
        wp_send_json_success($response, 200);
    }

    public function getAllLists($queryParams)
    {
        $apiKey = $queryParams->api_key ?: ($queryParams->value ?? '');
        $sendy_url = $queryParams->sendy_url ?? '';

        if (
            empty($apiKey)
            || empty($sendy_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $brand_id = $queryParams->brand_id;
        $apiEndpoint = "{$sendy_url}/api/lists/get-lists.php";
        $authorizationHeader['Accept'] = 'application/json';
        $requestsParams = [
            'api_key'  => $apiKey,
            'brand_id' => $brand_id
        ];
        $apiResponse = HttpHelper::post($apiEndpoint, $requestsParams, $authorizationHeader);

        $response = [];
        foreach ($apiResponse as $list) {
            $response[] = (object) [
                'listId'   => $list->id,
                'listName' => $list->name,
            ];
        }
        wp_send_json_success($response, 200);
    }
}
