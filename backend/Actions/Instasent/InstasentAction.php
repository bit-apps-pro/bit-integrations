<?php

namespace BitApps\Integrations\Actions\Instasent;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class InstasentAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'instasent',
        'fields'   => [
            'auth_token' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token ?? '';
        $fieldMap = $integrationDetails->field_map ?? '';
        $action = $integrationDetails->action ?? '';
        $actions = isset($integrationDetails->actions) ? $integrationDetails->actions : (object) [];

        if (
            empty($fieldMap)
            || empty($auth_token)
            || empty($action)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Instasent'));
        }

        $recordApiHelper = new InstasentService($auth_token, $integrationDetails, $integId);
        $instasentApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $auth_token,
            $action,
            $actions
        );

        return $instasentApiResponse;
    }
}
