<?php

/**
 * Klaviyo Integration
 */

namespace BitApps\Integrations\Actions\Klaviyo;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Klaviyo integration
 */
class KlaviyoController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'klaviyo',
        'fields'   => [
            'authKey' => 'value',
        ],
    ];

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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = $integrationDetails->authKey;
        $listId = $integrationDetails->listId;
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map)
            || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Klaviyo'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $klaviyoApiResponse = $recordApiHelper->execute(
            $listId,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($klaviyoApiResponse)) {
            return $klaviyoApiResponse;
        }

        return $klaviyoApiResponse;
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
