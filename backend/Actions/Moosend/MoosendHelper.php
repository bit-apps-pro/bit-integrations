<?php

/**
 * Moosend Record Api
 */

namespace BitApps\Integrations\Actions\Moosend;

use BitApps\Integrations\Core\Util\HttpHelper;

class MoosendHelper
{
    private $baseUrl = 'https://api.moosend.com/v3/';

    public static function formatPhoneNumber($field)
    {
        if (!preg_match('/^\+?[0-9\s\-\(\)]+$/', $field)) {
            return $field;
        }

        $leadingPlus = $field[0] === '+' ? '+' : '';
        $cleanedNumber = preg_replace('/[^\d]/', '', $field);
        $formattedDigits = trim(chunk_split($cleanedNumber, 3, ' '));

        return $leadingPlus . $formattedDigits;
    }

    public function getAllLists($requestParams)
    {
        $authKey = !empty($requestParams->authKey) ? $requestParams->authKey : (!empty($requestParams->api_key) ? $requestParams->api_key : '');
        if (empty($authKey)) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $apiEndpoints = $this->baseUrl . 'lists/1/1000.json?apikey=' . $authKey;
        $headers = [
            'Content-Type' => 'application/json',
            'Accept'       => 'application/json',
        ];
        $response = HttpHelper::get($apiEndpoints, null, $headers);
        if ($response->Error !== null) {
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
}
