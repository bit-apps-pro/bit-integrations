<?php

namespace BitApps\Integrations\Actions\Airtable;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class AirtableAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'airtable',
        'fields'   => [
            'auth_token' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($auth_token)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('fields are required for Airtable api', 'bit-integrations'));
        }

        $recordApiHelper = new AirtableService($integrationDetails, $integId);
        $airtableApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($airtableApiResponse)) {
            return $airtableApiResponse;
        }

        return $airtableApiResponse;
    }
}
