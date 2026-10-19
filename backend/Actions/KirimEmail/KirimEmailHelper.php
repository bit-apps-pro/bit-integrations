<?php

namespace BitApps\Integrations\Actions\KirimEmail;

use BitApps\Integrations\Core\Util\HttpHelper;

class KirimEmailHelper
{
    public function getAllList($tokenRequestParams)
    {
        $userName = $tokenRequestParams->userName ?? $tokenRequestParams->username ?? '';
        $apiKey = $tokenRequestParams->api_key ?? '';

        if (
            empty($userName)
            || empty($apiKey)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }

        $apiEndpoint = 'https://api.kirim.email/v3/list';
        $header = self::buildAuthHeaders($userName, $apiKey);

        $apiResponse = HttpHelper::get($apiEndpoint, null, $header);

        if (is_wp_error($apiResponse) || $apiResponse->code !== 200) {
            wp_send_json_error(
                empty($apiResponse->error) ? 'Unknown' : $apiResponse->error,
                400
            );
        }

        wp_send_json_success($apiResponse->data, 200);
    }

    private static function buildAuthHeaders(string $userName, string $apiKey): array
    {
        $time = time();
        $generatedToken = hash_hmac('sha256', "{$userName}" . '::' . "{$apiKey}" . '::' . $time, "{$apiKey}");

        return [
            'Auth-Id'    => $userName,
            'Auth-Token' => $generatedToken,
            'Timestamp'  => $time,
        ];
    }
}
