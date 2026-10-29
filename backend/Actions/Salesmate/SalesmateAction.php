<?php

namespace BitApps\Integrations\Actions\Salesmate;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SalesmateAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'salesmate',
        'fields'   => [
            'session_token' => 'value',
            'link_name'     => 'link_name',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $sessionToken = $integrationDetails->session_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $actionId = $integrationDetails->actionId;
        $linkName = $integrationDetails->link_name;

        if (empty($fieldMap) || empty($sessionToken) || empty($actionName) || empty($actionId) || empty($linkName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Salesmate'));
        }

        $recordApiHelper = new SalesmateService($integrationDetails, $integId, $sessionToken, $linkName);
        $salesmateApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionId);

        if (is_wp_error($salesmateApiResponse)) {
            return $salesmateApiResponse;
        }

        return $salesmateApiResponse;
    }
}
