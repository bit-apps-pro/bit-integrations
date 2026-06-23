<?php

/**
 * Instasent Integration
 */

namespace BitApps\Integrations\Actions\Instasent;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for Instasent integration
 */
class InstasentController
{
    private static $_baseUrl = 'https://api.instasent.com';

    public function authorize($refreshFieldsRequestParams)
    {
        if (empty($refreshFieldsRequestParams) || empty($refreshFieldsRequestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $endpoint = self::$_baseUrl . '/organization/account';
        $header = [
            'Authorization' => 'Bearer ' . $refreshFieldsRequestParams->auth_token,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ];

        $response = HttpHelper::get($endpoint, null, $header);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode == 200) {
            wp_send_json_success('Authorization Successful', 200);

            return;
        }

        wp_send_json_error(
            $response->message ?? $response ?? 'Authorization Failed',
            400
        );
    }

    public function refreshDatasources($refreshFieldsRequestParams)
    {
        if (empty($refreshFieldsRequestParams) || empty($refreshFieldsRequestParams->auth_token) || empty($refreshFieldsRequestParams->projectId)) {
            wp_send_json_error(
                __('Requested parameter is empty', 'bit-integrations'),
                400
            );
        }

        $project = rawurlencode($refreshFieldsRequestParams->projectId);
        $endpoint = self::$_baseUrl . "/v1/project/{$project}/datasource";
        $header = [
            'Authorization' => 'Bearer ' . $refreshFieldsRequestParams->auth_token,
            'Content-Type'  => 'application/json',
            'Accept'        => 'application/json',
        ];

        $response = HttpHelper::get($endpoint, null, $header);

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message(), 400);
        }

        if (HttpHelper::$responseCode == 200) {
            $entities = $response->entities ?? [];
            $formattedResponse = [];
            foreach ($entities as $entity) {
                $formattedResponse[] = [
                    'id'   => $entity->id ?? '',
                    'name' => $entity->name ?? ($entity->id ?? ''),
                ];
            }

            wp_send_json_success($formattedResponse, 200);

            return;
        }

        wp_send_json_error(
            $response->message ?? $response ?? __('Failed to fetch data sources', 'bit-integrations'),
            400
        );
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token ?? '';
        $fieldMap = $integrationDetails->field_map ?? '';
        $action = $integrationDetails->action ?? '';
        $actions = isset($integrationDetails->actions) ? $integrationDetails->actions : (object) [];

        if (
            empty($fieldMap)
            || empty($auth_token)
            || empty($action)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Instasent'));
        }

        $recordApiHelper = new RecordApiHelper($auth_token, $integrationDetails, $integId);
        $instasentApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $auth_token,
            $action,
            $actions
        );

        return $instasentApiResponse;
    }
}
