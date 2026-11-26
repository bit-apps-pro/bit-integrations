<?php

namespace BitApps\Integrations\Actions\SendinBlue;

use BitApps\Integrations\Core\Util\HttpHelper;

class SendinBlueHelper
{
    public const APIENDPOINT = 'https://api.sendinblue.com/v3';

    public function refreshlists($requestsParams)
    {
        if (empty($requestsParams->api_key)) {
            wp_send_json_error(
                __('Requested parameter is empty', 'bit-integrations'),
                400
            );
        }

        $allList = [];
        $limit = 50;
        $offset = 0;
        $hasMore = true;

        $authorizationHeader = [
            'Accept'  => 'application/json',
            'api-key' => $requestsParams->api_key
        ];

        while ($hasMore) {
            $apiEndpoint = self::APIENDPOINT . "/contacts/lists?limit={$limit}&offset={$offset}&sort=desc";
            $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

            if (!is_wp_error($apiResponse) && empty($apiResponse->code)) {
                $sblueList = $apiResponse->lists;
                if (empty($sblueList)) {
                    $hasMore = false;

                    break;
                }

                foreach ($sblueList as $list) {
                    $allList[$list->name] = (object) [
                        'id'   => $list->id,
                        'name' => $list->name
                    ];
                }
                $offset += $limit;
            } else {
                wp_send_json_error($apiResponse->message, 400);

                return;
            }
        }

        uksort($allList, 'strnatcasecmp');
        $response['sblueList'] = $allList;
        wp_send_json_success($response, 200);
    }

    public function refreshTemplate($requestsParams)
    {
        if (empty($requestsParams->api_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoint = self::APIENDPOINT . '/smtp/templates';
        $authorizationHeader['Accept'] = 'application/json';
        $authorizationHeader['api-key'] = $requestsParams->api_key;
        $sblueResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $allList = [];
        if (!is_wp_error($sblueResponse) && $sblueResponse->templates) {
            $sblueTemplates = $sblueResponse->templates;

            foreach ($sblueTemplates as $list) {
                $allList[$list->name] = (object) [
                    'id'   => $list->id,
                    'name' => ucfirst($list->name)
                ];
            }

            uksort($allList, 'strnatcasecmp');

            $response['sblueTemplates'] = $allList;
        } else {
            wp_send_json_error(
                $sblueResponse->message,
                400
            );
        }
        wp_send_json_success($response, 200);
    }

    public static function sendinblueHeaders($queryParams)
    {
        if (empty($queryParams->api_key)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoint = self::APIENDPOINT . '/contacts/attributes';
        $authorizationHeader['Accept'] = 'application/json';
        $authorizationHeader['api-key'] = $queryParams->api_key;
        $sblueResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $fields = [];
        if (!is_wp_error($sblueResponse)) {
            $excludingField = ['BLACKLIST', 'READERS', 'CLICKERS'];
            $allFields = $sblueResponse->attributes;

            foreach ($allFields as $field) {
                if (!\in_array($field->name, $excludingField)) {
                    $fields[$field->name] = (object) [
                        'fieldId'   => $field->name,
                        'fieldName' => $field->name,
                        'options'   => isset($field->enumeration) && \is_array($field->enumeration) ? $field->enumeration : []
                    ];
                }
            }
            $fields['Email'] = (object) ['fieldId' => 'email', 'fieldName' => 'Email', 'required' => true];
            $response['sendinBlueField'] = $fields;
            wp_send_json_success($response);
        }
    }
}
