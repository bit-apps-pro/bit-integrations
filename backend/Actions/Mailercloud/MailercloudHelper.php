<?php

namespace BitApps\Integrations\Actions\Mailercloud;

use BitApps\Integrations\Core\Util\HttpHelper;

class MailercloudHelper
{
    private $baseUrl = 'https://cloudapi.mailercloud.com/v1/';

    public function getAllLists($requestParams)
    {
        $apiKey = $this->extractApiKey($requestParams);
        if (empty($apiKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'lists/search';
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => $apiKey
        ];
        $body = [
            'limit' => 100,
            'page'  => 1
        ];
        $response = HttpHelper::post($apiEndpoints, wp_json_encode($body), $headers);

        if ($response->code === 'invalid_api_key') {
            wp_send_json_error(
                __(
                    'Invalid token',
                    'bit-integrations'
                ),
                400
            );
        }

        wp_send_json_success($response, 200);
    }

    public function getAllFields($requestParams)
    {
        $apiKey = $this->extractApiKey($requestParams);
        if (empty($apiKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'contact/property/search';
        $headers = [
            'Content-Type'  => 'application/json',
            'Authorization' => $apiKey
        ];
        $body = [
            'limit' => 100,
            'page'  => 1
        ];
        $response = HttpHelper::post($apiEndpoints, wp_json_encode($body), $headers);

        if ($response->code === 'invalid_api_key') {
            wp_send_json_error(
                __(
                    'Invalid token',
                    'bit-integrations'
                ),
                400
            );
        }
        $fields = [];
        $staticFieldsKeys = ['city', 'country', 'details', 'department', 'dob', 'email', 'industry', 'job_title', 'last_name', 'lead_source', 'middle_name', 'name', 'organization', 'phone', 'salary', 'state', 'zip', 'contact_type', 'list_id', 'lead_source', 'userip'];
        foreach ($response->data as $key => $field) {
            if (\in_array($field->field_value, $staticFieldsKeys)) {
                $fields[] = (object) [
                    'label'    => $field->field_name,
                    'key'      => $field->field_value,
                    'required' => $field->field_value == 'email' ? true : false,
                ];
            } else {
                $fields[] = (object) [
                    'label'    => $field->field_name,
                    'key'      => $field->id,
                    'required' => $field->field_value == 'email' ? true : false,
                ];
            }
        }

        wp_send_json_success($fields, 200);
    }

    private function extractApiKey($requestParams)
    {
        return !empty($requestParams->api_key) ? $requestParams->api_key : (isset($requestParams->authKey) ? $requestParams->authKey : '');
    }
}
