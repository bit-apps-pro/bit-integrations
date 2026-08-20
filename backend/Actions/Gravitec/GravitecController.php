<?php

/**
 * Gravitec Integration
 */

namespace BitApps\Integrations\Actions\Gravitec;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

/**
 * Provide functionality for Gravitec integration
 */
class GravitecController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'gravitec',
        'fields'   => [
            'app_key'    => 'username',
            'app_secret' => 'password',
            'site_url'   => 'site_url',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $appKey = $integrationDetails->app_key;
        $appSecret = $integrationDetails->app_secret;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($appKey) || empty($actionName) || empty($appSecret)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Gravitec'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $appKey, $appSecret);
        $gravitecApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($gravitecApiResponse)) {
            return $gravitecApiResponse;
        }

        return $gravitecApiResponse;
    }
}
