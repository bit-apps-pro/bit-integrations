<?php

namespace BitApps\Integrations\Actions\Sender;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SenderAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'sender',
        'fields'   => [
            'api_token' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId            = $integrationData->id;
        $fieldMap           = $integrationDetails->field_map ?? [];

        if (empty($integrationDetails->api_token)) {
            return new WP_Error('api_token_empty', __('Sender API token is required', 'bit-integrations'));
        }

        $recordApiHelper = new SenderService($integrationDetails, $integId);
        $senderResponse  = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($senderResponse)) {
            return $senderResponse;
        }

        return $senderResponse;
    }
}
