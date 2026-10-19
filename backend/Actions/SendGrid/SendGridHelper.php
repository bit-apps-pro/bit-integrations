<?php

/**
 * SendGrid Integration
 */

namespace BitApps\Integrations\Actions\SendGrid;

use BitApps\Integrations\Core\Util\HttpHelper;

class SendGridHelper
{
    public function getCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoints = 'https://api.sendgrid.com/v3/marketing/field_definitions';
        $apiKey = $fieldsRequestParams->apiKey;
        $header = [
            'Authorization' => 'Bearer ' . $apiKey
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        if (!isset($response->errors)) {
            $customFields = [];
            foreach ($response->custom_fields as $customField) {
                $customFields[] = [
                    'key'      => $customField->id,
                    'label'    => $customField->name,
                    'required' => false
                ];
            }
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error($response->errors[0]->message ?? __('Custom fields fetch failed', 'bit-integrations'), 400);
        }
    }

    public function getLists($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->apiKey)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $apiEndpoints = 'https://api.sendgrid.com/v3/marketing/lists';
        $apiKey = $fieldsRequestParams->apiKey;
        $header = [
            'Authorization' => 'Bearer ' . $apiKey
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);

        foreach ($response->result as $list) {
            $lists[] = [
                'id'   => $list->id,
                'name' => $list->name
            ];
        }

        if (!empty($lists)) {
            wp_send_json_success($lists, 200);
        } else {
            wp_send_json_error('Lists fetch failed', 400);
        }
    }
}
