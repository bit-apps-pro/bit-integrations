<?php

/**
 * ACPT Integration
 */

namespace BitApps\Integrations\Actions\ACPT;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

/**
 * Provide functionality for ACPT integration
 */
class ACPTController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'acpt',
        'fields'   => [
            'api_key'  => 'value',
            'base_url' => 'base_url',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $baseUrl = $integrationDetails->base_url;
        $fieldMap = $integrationDetails->field_map;
        $module = $integrationDetails->module;

        if (empty($fieldMap) || empty($module) || empty($apiKey) || empty($baseUrl)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'ACPT'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $apiKey, $baseUrl);
        $acptApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $module);

        if (is_wp_error($acptApiResponse)) {
            return $acptApiResponse;
        }

        return $acptApiResponse;
    }
}
