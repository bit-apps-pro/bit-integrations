<?php

namespace BitApps\Integrations\Actions\Mailify;

use BitApps\Integrations\Core\Util\HttpHelper;

class MailifyHelper
{
    public static function mailifyHeaders($requestParams)
    {
        $credentials = self::extractCredentials($requestParams);
        if (empty($credentials['account_id']) || empty($credentials['api_key'])) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $listId = $requestParams->list_id;
        $apiEndpoint = "https://mailifyapis.com/v1/lists/{$listId}/fields";
        $headers = [
            'accountId' => $credentials['account_id'],
            'apiKey'    => $credentials['api_key'],
        ];

        $mailifyResponse = HttpHelper::get($apiEndpoint, null, $headers);

        $fields = [];
        if (!is_wp_error($mailifyResponse->fields)) {
            $allFields = $mailifyResponse->fields;
            $unwantedFieldKeys = ['id', 'CREATION_DATE_ID', 'MODIFICATION_DATE_ID'];
            foreach ($allFields as $field) {
                if (!\in_array($field->id, $unwantedFieldKeys)) {
                    $fields[$field->caption] = (object) [
                        'fieldName'  => $field->caption,
                        'fieldValue' => $field->id,
                        'required'   => strtolower($field->caption) == 'email' ? true : false
                    ];
                }
            }

            $response['mailifyField'] = $fields;
            wp_send_json_success($response);
        }
    }

    public static function getAllList($requestParams)
    {
        $credentials = self::extractCredentials($requestParams);
        if (empty($credentials['account_id']) || empty($credentials['api_key'])) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $headers = [
            'accountId' => $credentials['account_id'],
            'apiKey'    => $credentials['api_key'],
        ];
        $apiEndpoint = 'https://mailifyapis.com/v1/lists';
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);
        $lists = [];

        foreach ($apiResponse as $item) {
            $lists[] = [
                'listId'   => $item->id,
                'listName' => $item->name
            ];
        }

        if ((\count($lists)) > 0) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error('List fetching failed', 400);
        }
    }

    private static function extractCredentials($requestParams)
    {
        $accountId = !empty($requestParams->account_id) ? $requestParams->account_id : (!empty($requestParams->username) ? $requestParams->username : '');
        $apiKey = !empty($requestParams->api_key) ? $requestParams->api_key : (!empty($requestParams->password) ? $requestParams->password : '');

        return [
            'account_id' => $accountId,
            'api_key'    => $apiKey,
        ];
    }
}
