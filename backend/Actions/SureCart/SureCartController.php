<?php

namespace BitApps\Integrations\Actions\SureCart;

use WP_Error;

class SureCartController
{
    public $api_url = 'https://api.surecart.com/v1/';

    public function checkAuthorization($tokenRequestParams)
    {
        if (
            empty($tokenRequestParams->api_key) || empty($tokenRequestParams->auth_url)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiKey = $tokenRequestParams->api_key;
        $webhook_url = $tokenRequestParams->auth_url . '/surecart/webhooks';

        $request_data = [
            'webhook_endpoint' => [
                'description' => 'Authorization',
                'enabled'     => true,
                'destination' => 'wordpress',
                'url'         => $webhook_url,
            ],
        ];

        $headers = [
            'headers' => [
                'Authorization' => 'Bearer ' . $apiKey,
                'User-Agent'    => 'bit-integrations',
                'Content-Type'  => 'application/json',
            ],
            'timeout'     => 60,
            'sslverify'   => false,
            'data_format' => 'body',
            'body'        => wp_json_encode($request_data),
        ];

        $request = wp_remote_post($this->api_url . 'webhook_endpoints', $headers);
        if (is_wp_error($request)) {
            wp_send_json_error($request->get_error_message(), 400);
        }
        $request_body = wp_remote_retrieve_body($request);
        $request_data = json_decode($request_body);
        if (!$request_data || $request_data->code !== 'unauthorized') {
            wp_send_json_success($request_body, 200);
        } else {
            wp_send_json_error(
                $request_data->message,
                400
            );
        }
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;
        $api_key = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction;

        if (
            empty($api_key)
            || empty($integrationDetails)
            || empty($fieldMap)

        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'sureCart'));
        }
        $recordApiHelper = new RecordApiHelper($integrationId);

        return $recordApiHelper->execute(
            $api_key,
            $fieldValues,
            $fieldMap,
            $integrationDetails,
            $mainAction
        );
    }
}
