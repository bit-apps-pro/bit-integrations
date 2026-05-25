<?php

namespace BitApps\Integrations\Actions\Notion;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class NotionController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'notion',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $databaseId = $integrationDetails->databaseId;
        $notionFields = $integrationDetails->notionFields;
        $tokenDetails = $integrationDetails->tokenDetails ?? null;
        $accessToken = $tokenDetails->access_token ?? ($integrationDetails->access_token ?? '');
        $tokenType = $tokenDetails->token_type ?? ($integrationDetails->token_type ?? 'Bearer');
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map) || empty($accessToken)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'notion'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        $notionApiResponse = $recordApiHelper->execute(
            $databaseId,
            $accessToken,
            $tokenType,
            $notionFields,
            $fieldValues,
            $field_map,
        );

        if (is_wp_error($notionApiResponse)) {
            return $notionApiResponse;
        }

        return $notionApiResponse;
    }
}
