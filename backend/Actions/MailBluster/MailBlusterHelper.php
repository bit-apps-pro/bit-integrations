<?php

namespace BitApps\Integrations\Actions\MailBluster;

use BitApps\Integrations\Core\Util\HttpHelper;

class MailBlusterHelper
{
    protected $_defaultHeader;

    private $baseUrl = 'https://api.mailbluster.com/api/';

    public function fetchCustomFields($fieldsRequestParams)
    {
        if (empty($fieldsRequestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoints = $this->baseUrl . 'fields';
        $apiKey = $fieldsRequestParams->auth_token;
        $header = [
            'Authorization' => $apiKey,
        ];

        $response = HttpHelper::get($apiEndpoints, null, $header);
        $customFields = [];

        foreach ($response->fields as $field) {
            $customFields[] = [
                'key'      => $field->fieldMergeTag,
                'label'    => $field->fieldLabel,
                'required' => false
            ];
        }

        if (property_exists($response, 'fields')) {
            wp_send_json_success($customFields, 200);
        } else {
            wp_send_json_error(__('Please enter valid API key', 'bit-integrations'), 400);
        }
    }
}
