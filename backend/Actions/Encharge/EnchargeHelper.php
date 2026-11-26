<?php

namespace BitApps\Integrations\Actions\Encharge;

use BitApps\Integrations\Core\Util\HttpHelper;

class EnchargeHelper
{
    public const APIENDPOINT = 'https://api.encharge.io/v1/';

    public static function enchargeHeaders($queryParams)
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
        $apiEndpoint = self::APIENDPOINT . 'fields';
        $authorizationHeader['Accept'] = 'application/json';
        $authorizationHeader['X-Encharge-Token'] = $queryParams->api_key;
        $enChargeResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);
        $fields = [];
        if (!is_wp_error($enChargeResponse)) {
            $allFields = $enChargeResponse->items;
            foreach ($allFields as $field) {
                $required = $field->name === 'email' ? true : false;
                $fields[$field->name] = (object) [
                    'fieldId'   => $field->name,
                    'fieldName' => ucfirst($field->name),
                    'required'  => $required
                ];
            }
            $response['enChargeFields'] = $fields;
            wp_send_json_success($response);
        }
    }
}
