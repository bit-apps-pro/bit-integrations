<?php

/**
 * KirimEmail Integration
 */

namespace BitApps\Integrations\Actions\KirimEmail;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class KirimEmailAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::CUSTOM,
        'slug'     => 'KirimEmail',
        'fields'   => [
            'api_key'  => 'api_key',
            'userName' => 'userName',
        ],
    ];

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
        $recordApiHelper = new KirimEmailService($integrationId);
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
}
