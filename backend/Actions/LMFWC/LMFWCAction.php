<?php

namespace BitApps\Integrations\Actions\LMFWC;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class LMFWCAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'lmfwc',
        // Connections store the UI's display name, which spells the plugin out.
        'aliases'  => ['License Manager For WooCommerce'],
        'fields'   => [
            'api_key'    => 'value',
            'api_secret' => 'api_secret',
            'base_url'   => 'base_url',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $apiSecret = $integrationDetails->api_secret;
        $baseUrl = $integrationDetails->base_url;
        $fieldMap = $integrationDetails->field_map;
        $module = $integrationDetails->module;

        if (empty($fieldMap) || empty($apiSecret) || empty($module) || empty($apiKey) || empty($baseUrl)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'License Manager For WooCommerce'));
        }

        $recordApiHelper = new LMFWCService($integrationDetails, $integId, $apiSecret, $apiKey, $baseUrl);
        $lmfwcApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $module);

        if (is_wp_error($lmfwcApiResponse)) {
            return $lmfwcApiResponse;
        }

        return $lmfwcApiResponse;
    }
}
