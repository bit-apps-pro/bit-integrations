<?php

namespace BitApps\Integrations\Actions\Woodpecker;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class WoodpeckerAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'woodpecker',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($apiKey) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Woodpecker'));
        }

        $recordApiHelper = new WoodpeckerService($integrationDetails, $integId, base64_encode($apiKey));
        $woodpeckerApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName, $actions);

        if (is_wp_error($woodpeckerApiResponse)) {
            return $woodpeckerApiResponse;
        }

        return $woodpeckerApiResponse;
    }
}
