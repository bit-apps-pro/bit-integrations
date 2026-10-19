<?php

/**
 * Drip Integration
 */

namespace BitApps\Integrations\Actions\Drip;

use BitApps\Integrations\Core\Util\HttpHelper;

class DripHelper
{
    public static function getAllAccounts($requestsParams)
    {
        if (empty($requestsParams->api_token)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $header['Authorization'] = 'Basic ' . base64_encode("{$requestsParams->api_token}:");

        $apiEndpoint = 'https://api.getdrip.com/v2/accounts';

        $response = HttpHelper::get($apiEndpoint, null, $header);

        if (!isset($response->accounts)) {
            wp_send_json_error(
                empty($apiResponse) ? 'Unknown' : $apiResponse,
                400
            );
        }

        $accounts = [];

        foreach ($response->accounts as $account) {
            $accounts[] = [
                'accountId'   => $account->id,
                'accountName' => $account->name . ' (' . $account->url . ')'
            ];
        }

        wp_send_json_success($accounts, 200);
    }

    public static function getCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_token) || empty($fieldsRequestParams->selectedAccountId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiToken = $fieldsRequestParams->api_token;
        $accountId = $fieldsRequestParams->selectedAccountId;
        $apiEndpoints = 'https://api.getdrip.com/v2/' . $accountId . '/custom_field_identifiers';
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$apiToken}:")
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        if (!isset($response->custom_field_identifiers)) {
            wp_send_json_error(__('Custom fields fetch failed', 'bit-integrations'), 400);
        }

        $staticFieldsKey = ['email', 'first_name', 'last_name', 'address1', 'address2', 'city', 'state', 'zip', 'country', 'phone', 'time_zone', 'ip_address'];
        $customFields = [];

        foreach ($response->custom_field_identifiers as $customFieldKey) {
            if (!\in_array($customFieldKey, $staticFieldsKey)) {
                $customFields[] = (object) [
                    'key'      => $customFieldKey,
                    'label'    => ucwords(str_replace('_', ' ', $customFieldKey)),
                    'required' => false
                ];
            }
        }

        wp_send_json_success($customFields, 200);
    }

    public static function getAllTags($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->api_token) || empty($fieldsRequestParams->selectedAccountId)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiToken = $fieldsRequestParams->api_token;
        $accountId = $fieldsRequestParams->selectedAccountId;
        $apiEndpoints = 'https://api.getdrip.com/v2/' . $accountId . '/tags';
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$apiToken}:")
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        if (isset($response->tags)) {
            wp_send_json_success($response->tags, 200);
        }

        wp_send_json_error(__('Tags fetching failed', 'bit-integrations'), 400);
    }
}
