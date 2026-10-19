<?php

/**
 * DirectIQ Integration
 */

namespace BitApps\Integrations\Actions\DirectIq;

use BitApps\Integrations\Core\Util\HttpHelper;

class DirectIqHelper
{
    public static function _apiEndpoint($method)
    {
        return "https://clientapi.benchmarkemail.com/{$method}";
    }

    public static function directIqLists($queryParams)
    {
        if (
            empty($queryParams->client_id) || empty($queryParams->client_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = 'https://rest.directiq.com/contacts/lists/list';

        $authorizationHeader['authorization'] = 'Basic ' . base64_encode("{$queryParams->client_id}:{$queryParams->client_secret}");
        $directIqResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $lists = [];
        if (!is_wp_error($directIqResponse)) {
            $allLists = ($directIqResponse);

            foreach ($allLists as $key => $list) {
                $lists[$list->name] = (object) [
                    'listId'   => $list->id,
                    'listName' => $list->name,
                ];
            }

            $response['directIqLists'] = $lists;
            wp_send_json_success($response);
        }
    }

    public static function directIqHeaders($queryParams)
    {
        if (
            empty($queryParams->client_id) || empty($queryParams->client_secret)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $listId = $queryParams->list_id;

        $apiEndpoint = 'https://rest.directiq.com/subscription/fields';

        $authorizationHeader['authorization'] = 'Basic ' . base64_encode("{$queryParams->client_id}:{$queryParams->client_secret}");
        $directIqResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $fields = [];
        if (!is_wp_error($directIqResponse)) {
            $allFields = $directIqResponse;

            foreach ($allFields as $field) {
                $fields[$field->shortCode] = (object) [
                    'fieldId'    => $field->shortCode,
                    'fieldName'  => $field->name,
                    'fieldValue' => strtolower(str_replace(' ', '_', $field->name)),
                    'required'   => strtolower($field->name) == 'email' ? true : false
                ];
            }

            $response['directIqField'] = $fields;

            wp_send_json_success($response);
        }
    }
}
