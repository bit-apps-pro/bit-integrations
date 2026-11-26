<?php

namespace BitApps\Integrations\Actions\MoxieCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MoxieCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'moxiecrm',
        'fields'   => [
            'api_key' => 'value',
            'api_url' => 'api_url',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->api_key;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'MoxieCRM'));
        }

        $recordApiHelper = new MoxieCRMService($integrationDetails, $integId);
        $moxiecrmApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($moxiecrmApiResponse)) {
            return $moxiecrmApiResponse;
        }

        return $moxiecrmApiResponse;
    }
}
