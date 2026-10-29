<?php

namespace BitApps\Integrations\Actions\HefflCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class HefflCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'hefflcrm',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->api_key ?? '';
        $fieldMap = $integrationDetails->field_map ?? [];

        if (empty($fieldMap) || empty($apiKey)) {
            // translators: %s is the name of the integration.
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('API key and field map are required for %s api', 'bit-integrations'), 'Heffl CRM'));
        }

        $recordApiHelper = new HefflCRMService($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap);
    }
}
