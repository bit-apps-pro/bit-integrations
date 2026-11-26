<?php

namespace BitApps\Integrations\Actions\Acumbamail;

use BitApps\Integrations\Core\Util\HttpHelper;

class AcumbamailHelper
{
    private $baseUrl = 'https://acumbamail.com/api/1/';

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

        $apiEndpoints = $this->baseUrl . 'getLists/';

        $requestParams = [
            'auth_token' => $requestParams->auth_token,
        ];

        $response = HttpHelper::post($apiEndpoints, $requestParams);

        if ($response !== 'Unauthorized') {
            wp_send_json_success($response, 200);
        } else {
            wp_send_json_error(
                'The token is invalid',
                400
            );
        }
    }

    public function acumbamailRefreshFields($refreshFieldsRequestParams)
    {
        if (empty($refreshFieldsRequestParams->auth_token) || empty($refreshFieldsRequestParams->list_id)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'getListFields/';

        $requestParams = [
            'auth_token' => $refreshFieldsRequestParams->auth_token,
            'list_id'    => $refreshFieldsRequestParams->list_id,
        ];

        $response = HttpHelper::post($apiEndpoints, $requestParams);
        $formattedResponse = [];
        foreach ($response->fields as $value) {
            $formattedResponse[$value->name] = [
                'key'      => $value->tag,
                'label'    => $value->label,
                'required' => $value->type === 'email' ? true : false,
            ];
        }

        if ($response !== 'Unauthorized') {
            wp_send_json_success($formattedResponse, 200);
        } else {
            wp_send_json_error(
                'The token is invalid',
                400
            );
        }
    }
}
