<?php

/**
 * ZohoSheet Integration
 */

namespace BitApps\Integrations\Actions\ElasticEmail;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for ZohoCrm integration
 */
class ElasticEmailController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'elasticemail',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

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
        // wp_send_json_success(true);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;

        $api_key = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;
        if (empty($api_key)
            || empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Elastic Email'));
        }
        $recordApiHelper = new RecordApiHelper($api_key, $integId);
        $elasticEmailApiResponse = $recordApiHelper->execute(
            $integId,
            $fieldValues,
            $fieldMap,
            $integrationDetails
            // $actions
        );

        if (is_wp_error($elasticEmailApiResponse)) {
            return $elasticEmailApiResponse;
        }

        return $elasticEmailApiResponse;
    }
}
