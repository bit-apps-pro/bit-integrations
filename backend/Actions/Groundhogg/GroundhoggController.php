<?php

/**
 * Groundhogg Integration
 */

namespace BitApps\Integrations\Actions\Groundhogg;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Groundhogg integration
 */
class GroundhoggController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'groundhogg',
        'fields'   => [
            'token'      => 'value',
            'public_key' => 'public_key',
            'domainName' => 'domainName',
        ],
    ];

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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $actions = $integrationDetails->actions;

        if (
            empty($fieldMap)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Groundhogg'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $groundhoggApiResponse = $recordApiHelper->execute(
            $fieldValues,
            $fieldMap,
            $integrationDetails,
            $actions
        );

        if (is_wp_error($groundhoggApiResponse)) {
            return $groundhoggApiResponse;
        }

        return $groundhoggApiResponse;
    }
}
