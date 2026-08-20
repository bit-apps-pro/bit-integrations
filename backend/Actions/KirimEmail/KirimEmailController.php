<?php

/**
 * KirimEmail Integration
 */

namespace BitApps\Integrations\Actions\KirimEmail;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use WP_Error;

/**
 * Provide functionality for KirimEmail integration
 */
class KirimEmailController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::CUSTOM,
        'slug'     => 'KirimEmail',
        'fields'   => [
            'api_key'  => 'api_key',
            'userName' => 'userName',
        ],
    ];

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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integrationId = $integrationData->id;
        $api_key = $integrationDetails->api_key;
        $userName = $integrationDetails->userName ?? $integrationDetails->username ?? '';
        $fieldMap = $integrationDetails->field_map;
        $mainAction = $integrationDetails->mainAction;

        if (
            empty($api_key)
            || empty($integrationDetails)
            || empty($userName)
            || empty($fieldMap)

        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Kirim Email'));
        }
        $recordApiHelper = new RecordApiHelper($integrationId);
        $kirinEmailApiResponse = $recordApiHelper->execute(
            $api_key,
            $userName,
            $fieldValues,
            $fieldMap,
            $integrationDetails,
            $mainAction
        );

        if (is_wp_error($kirinEmailApiResponse)) {
            return $kirinEmailApiResponse;
        }

        return $kirinEmailApiResponse;
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
