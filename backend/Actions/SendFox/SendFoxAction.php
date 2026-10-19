<?php

/**
 * SendFox Integration
 */

namespace BitApps\Integrations\Actions\SendFox;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SendFoxAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'sendfox',
        'fields'   => [
            'access_token' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $access_token = $integrationDetails->access_token;
        $listId = $integrationDetails->listId;
        $fieldMap = $integrationDetails->field_map;

        if (
            empty($access_token)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'SendFox'));
        }
        $recordApiHelper = new SendFoxService($integrationDetails, $integId);
        $acumbamailApiResponse = $recordApiHelper->execute(
            $listId,
            $fieldValues,
            $fieldMap,
            $access_token,
            $integrationDetails
        );

        if (is_wp_error($acumbamailApiResponse)) {
            return $acumbamailApiResponse;
        }

        return $acumbamailApiResponse;
    }
}
