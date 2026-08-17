<?php

/**
 * Moosend Integration
 */

namespace BitApps\Integrations\Actions\Moosend;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Moosend integration
 */
class MoosendController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'moosend',
        'fields'   => [
            'authKey' => 'value',
        ],
    ];

    private $baseUrl = 'https://api.moosend.com/v3/';

    public function getAllLists($requestParams)
    {
        $authKey = !empty($requestParams->authKey) ? $requestParams->authKey : (!empty($requestParams->api_key) ? $requestParams->api_key : '');
        if (empty($authKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'lists/1/1000.json?apikey=' . $authKey;
        $headers = [
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = !empty($integrationDetails->authKey) ? $integrationDetails->authKey : (isset($integrationDetails->api_key) ? $integrationDetails->api_key : '');
        $listId = $integrationDetails->listId;
        $method = $integrationDetails->method;
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map)
            || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Moosend'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $moosendApiResponse = $recordApiHelper->execute(
            $listId,
            $method,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($moosendApiResponse)) {
            return $moosendApiResponse;
        }

        return $moosendApiResponse;
    }
}
