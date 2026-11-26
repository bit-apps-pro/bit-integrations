<?php

namespace BitApps\Integrations\Actions\AgiledCRM;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class AgiledCRMAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'agiledcrm',
        'fields'   => [
            'auth_token' => 'value',
            'brand'      => 'brand',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authToken = $integrationDetails->auth_token;
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;

        if (empty($fieldMap) || empty($authToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Agiled CRM'));
        }

        $recordApiHelper = new AgiledCRMService($integrationDetails, $integId);
        $agiledApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($agiledApiResponse)) {
            return $agiledApiResponse;
        }

        return $agiledApiResponse;
    }
}
