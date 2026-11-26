<?php

namespace BitApps\Integrations\Actions\BenchMark;

use BitApps\Integrations\Core\Util\HttpHelper;

class BenchMarkHelper
{
    public static function _apiEndpoint($method)
    {
        return "https://clientapi.benchmarkemail.com/{$method}";
    }

    public static function benchMarkLists($queryParams)
    {
        if (empty($queryParams->api_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = self::_apiEndpoint('Contact/');

        $authorizationHeader['AuthToken'] = $queryParams->api_secret;
        $benchMarkResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $lists = [];
        if (!is_wp_error($benchMarkResponse)) {
            $allLists = (object) ($benchMarkResponse->Response->Data);

            foreach ($allLists as $key => $list) {
                $lists[$list->Name] = (object) [
                    'listId'   => $list->ID,
                    'listName' => $list->Name,
                ];
            }
            $response['benchMarkLists'] = $lists;
            wp_send_json_success($response);
        }
    }

    public static function benchMarkHeaders($queryParams)
    {
        if (empty($queryParams->api_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = "https://clientapi.benchmarkemail.com/Contact/{$queryParams->list_id}";
        $authorizationHeader['AuthToken'] = $queryParams->api_secret;
        $benchMarkResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $fields = [
            'Email' => (object) [
                'fieldId'    => 'Email',
                'fieldName'  => 'Email',
                'fieldValue' => 'Email',
                'required'   => true
            ],
            'FirstName' => (object) [
                'fieldId'    => 'FirstName',
                'fieldName'  => 'First Name',
                'fieldValue' => 'FirstName',
                'required'   => false
            ],
            'LastName' => (object) [
                'fieldId'    => 'LastName',
                'fieldName'  => 'Last Name',
                'fieldValue' => 'LastName',
                'required'   => false
            ],
            'MiddleName' => (object) [
                'fieldId'    => 'MiddleName',
                'fieldName'  => 'Middle Name',
                'fieldValue' => 'MiddleName',
                'required'   => false
            ]
        ];

        if (!is_wp_error($benchMarkResponse) && !empty($benchMarkResponse->Response->Data)) {
            foreach ((array) $benchMarkResponse->Response->Data as $key => $field) {
                if (substr($key, 0, 5) === 'Field' && substr($key, \strlen($key) - 4, \strlen($key)) === 'Name') {
                    $key = str_replace('Name', '', $key);

                    $fields[$key] = (object) [
                        'fieldId'    => $key,
                        'fieldName'  => $field,
                        'fieldValue' => $key,
                        'required'   => false
                    ];
                }
            }
        }

        wp_send_json_success(['benchMarkField' => $fields]);
    }
}
