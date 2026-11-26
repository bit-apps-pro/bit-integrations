<?php

namespace BitApps\Integrations\Actions\Acumbamail;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class AcumbamailAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'acumbamail',
        'fields'   => [
            'auth_token' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $listId = $integrationDetails->listId;
        $mainAction = $integrationDetails->mainAction;
        $fieldMap = $integrationDetails->field_map;
        $doubleOptin = $integrationDetails->actions->double_optin;

        if (
            empty($listId)
            || empty($fieldMap)
            || empty($auth_token)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Acumbamail'));
        }
        $recordApiHelper = new AcumbamailService($integrationDetails, $integId);
        $acumbamailApiResponse = $recordApiHelper->execute(
            $listId,
            $mainAction,
            $fieldValues,
            $fieldMap,
            $auth_token,
            $doubleOptin
        );

        if (is_wp_error($acumbamailApiResponse)) {
            return $acumbamailApiResponse;
        }

        return $acumbamailApiResponse;
    }
}
