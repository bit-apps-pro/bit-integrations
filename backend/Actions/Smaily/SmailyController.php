<?php

/**
 * Smaily Integration
 */

namespace BitApps\Integrations\Actions\Smaily;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

/**
 * Provide functionality for Smaily integration
 */
class SmailyController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'smaily',
        'fields'   => [
            'api_user_name'     => 'username',
            'api_user_password' => 'password',
            'subdomain'         => 'subdomain',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($integrationDetails->subdomain) || empty($integrationDetails->api_user_name) || empty($integrationDetails->api_user_password)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields are required for Smaily api', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $smailyApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($smailyApiResponse)) {
            return $smailyApiResponse;
        }

        return $smailyApiResponse;
    }
}
