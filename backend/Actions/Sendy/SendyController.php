<?php

/**
 * Sendy Integration.
 */

namespace BitApps\Integrations\Actions\Sendy;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for Sendy integration.
 */
class SendyController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'sendy',
        'fields'   => [
            'api_key'   => 'value',
            'sendy_url' => 'sendy_url',
        ],
    ];

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
        // $authorizationHeader["api-key"] = $queryParams->api_key;
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
        // $authorizationHeader["api-key"] = $queryParams->api_key;
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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $integId = $integrationData->id;

        if (
            empty($apiKey)
            || empty($fieldMap)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('api key, fields map are required for sendy api', 'bit-integrations'));
            LogHandler::save($integId, 'contact', 'validation', $error);

            return $error;
        }
        $recordApiHelper = new RecordApiHelper($integId);
        $hubspotResponse = $recordApiHelper->execute(
            $integId,
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $apiKey
        );
        if (is_wp_error($hubspotResponse)) {
            return $hubspotResponse;
        }

        return $hubspotResponse;
    }
}
