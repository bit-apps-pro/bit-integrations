<?php

namespace BitApps\Integrations\Actions\Vbout;

use BitApps\Integrations\Core\Util\HttpHelper;

class VboutHelper
{
    private $baseUrl = 'https://api.vbout.com/1/';

    public function fetchAllLists($requestParams)
    {
        if (empty($requestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'emailmarketing/getlists.json?key=' . $requestParams->auth_token;

        $response = HttpHelper::post($apiEndpoints, null);

        $formattedResponse = [];
        if ($response->response->header->status !== 'ok') {
            wp_send_json_error(
                'The token is invalid',
                400
            );
        } else {
            foreach ($response->response->data->lists->items as $value) {
                $formattedResponse[]
    = [
        'list_id' => $value->id,
        'name'    => $value->name,
        'fields'  => $value->fields
    ];
            }
        }

        wp_send_json_success($formattedResponse, 200);
    }

    public function vboutRefreshFields($requestParams)
    {
        if (empty($requestParams->auth_token)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'emailmarketing/getlist.json?key=' . $requestParams->auth_token . '&id=' . $requestParams->list_id;

        $response = HttpHelper::post($apiEndpoints, null);

        $formattedResponse = [];
        if ($response->response->header->status !== 'ok') {
            wp_send_json_error(
                'The token is invalid',
                400
            );
        } else {
            foreach ($response->response->data->list->fields as $key => $value) {
                $formattedResponse[] = [
                    'key'      => $key,
                    'label'    => $value,
                    'required' => $value === 'Email Address' ? true : false,
                ];
            }
        }

        wp_send_json_success($formattedResponse, 200);
    }
}
