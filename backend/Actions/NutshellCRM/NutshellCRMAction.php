<?php

namespace BitApps\Integrations\Actions\NutshellCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class NutshellCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'nutshellcrm',
        'fields'   => [
            'user_name' => 'username',
            'api_token' => 'password',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $userName = $integrationDetails->user_name;
        $apiToken = $integrationDetails->api_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($userName) || empty($apiToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'NutshellCRM'));
        }

        $recordApiHelper = new NutshellCRMService($integrationDetails, $integId, $userName, $apiToken);
        $nutshellCRMApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($nutshellCRMApiResponse)) {
            return $nutshellCRMApiResponse;
        }

        return $nutshellCRMApiResponse;
    }
}
