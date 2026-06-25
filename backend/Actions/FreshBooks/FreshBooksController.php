<?php

namespace BitApps\Integrations\Actions\FreshBooks;

use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

class FreshBooksController
{
    public function authorization($requestParams)
    {
        if (empty($requestParams->access_token) || empty($requestParams->account_id)) {
            wp_send_json_error(
                __('Access Token and Account ID are required', 'bit-integrations'),
                400
            );
        }

        $apiEndpoints = 'https://api.freshbooks.com/auth/api/v1/users/me';
        $headers = [
            'Authorization' => 'Bearer ' . $requestParams->access_token,
            'Api-Version'   => 'alpha',
            'Content-Type'  => 'application/json',
        ];
        $response = HttpHelper::get($apiEndpoints, null, $headers);

        if (isset($response->response) && !isset($response->response->errors)) {
            wp_send_json_success(__('Authorization Success', 'bit-integrations'), 200);
        }

        wp_send_json_error(__('The access token is invalid', 'bit-integrations'), 400);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $accessToken = $integrationDetails->access_token ?? '';
        $accountId = $integrationDetails->account_id ?? '';
        $businessId = $integrationDetails->business_id ?? '';
        $fieldMap = $integrationDetails->field_map ?? [];
        $mainAction = $integrationDetails->mainAction ?? '';
        $utilities = $integrationDetails->utilities ?? [];

        if (empty($accessToken) || empty($accountId)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Access Token and Account ID are required for FreshBooks', 'bit-integrations'));
        }

        if (empty($mainAction)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Action is required for FreshBooks', 'bit-integrations'));
        }

        if (empty($fieldMap)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Field map is required for FreshBooks', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $accessToken, $accountId, $businessId);
        $freshBooksApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $mainAction, $utilities);

        if (is_wp_error($freshBooksApiResponse)) {
            return $freshBooksApiResponse;
        }

        return $freshBooksApiResponse;
    }
}
