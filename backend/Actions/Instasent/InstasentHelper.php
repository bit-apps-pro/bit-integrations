<?php

/**
 * Instasent Integration
 */

namespace BitApps\Integrations\Actions\Instasent;

use BitApps\Integrations\Core\Util\HttpHelper;

class InstasentHelper
{
    private static $_baseUrl = 'https://api.instasent.com';

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
}
