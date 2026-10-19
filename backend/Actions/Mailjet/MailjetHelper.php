<?php

/**
 * Mailjet Integration
 */

namespace BitApps\Integrations\Actions\Mailjet;

use BitApps\Integrations\Core\Util\HttpHelper;

class MailjetHelper
{
    public function getAllLists($fieldsRequestParams)
    {
        $apiKey = !empty($fieldsRequestParams->apiKey) ? $fieldsRequestParams->apiKey : (!empty($fieldsRequestParams->username) ? $fieldsRequestParams->username : '');
        $secretKey = !empty($fieldsRequestParams->secretKey) ? $fieldsRequestParams->secretKey : (!empty($fieldsRequestParams->password) ? $fieldsRequestParams->password : '');
        if (empty($secretKey) || empty($apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoints = 'https://api.mailjet.com/v3/REST/contactslist?Limit=1000';
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$secretKey}")
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        if (!empty($response)) {
            foreach ($response->Data as $list) {
                $lists[] = [
                    'id'   => (string) $list->ID,
                    'name' => $list->Name
                ];
            }
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error(__('Please enter valid API key', 'bit-integrations'), 400);
        }
    }

    public function getCustomFields($fieldsRequestParams)
    {
        $apiKey = !empty($fieldsRequestParams->apiKey) ? $fieldsRequestParams->apiKey : (!empty($fieldsRequestParams->username) ? $fieldsRequestParams->username : '');
        $secretKey = !empty($fieldsRequestParams->secretKey) ? $fieldsRequestParams->secretKey : (!empty($fieldsRequestParams->password) ? $fieldsRequestParams->password : '');
        if (empty($secretKey) || empty($apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoints = 'https://api.mailjet.com/v3/REST/contactmetadata?Limit=1000';
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$secretKey}")
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        foreach ($response->Data as $customField) {
            $customFields[] = [
                'key'      => $customField->Name,
                'label'    => ucfirst(str_replace('_', ' ', $customField->Name)),
                'required' => false
            ];
        }

        if (!empty($customFields)) {
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error(__('Custom fields fetch failed', 'bit-integrations'), 400);
        }
    }
}
