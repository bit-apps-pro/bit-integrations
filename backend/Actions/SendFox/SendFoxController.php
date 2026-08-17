<?php

/**
 * SendFox Integration
 */

namespace BitApps\Integrations\Actions\SendFox;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class SendFoxController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'sendfox',
        'fields'   => [
            'access_token' => 'token',
        ],
    ];

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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $access_token = $integrationDetails->access_token;
        $listId = $integrationDetails->listId;
        $fieldMap = $integrationDetails->field_map;

        if (
            // empty($listId)||
            // empty($fieldMap)||
            empty($access_token)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'SendFox'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $acumbamailApiResponse = $recordApiHelper->execute(
            $listId,
            $fieldValues,
            $fieldMap,
            $access_token,
            $integrationDetails
        );

        if (is_wp_error($acumbamailApiResponse)) {
            return $acumbamailApiResponse;
        }

        return $acumbamailApiResponse;
    }
}
