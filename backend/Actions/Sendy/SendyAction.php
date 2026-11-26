<?php

namespace BitApps\Integrations\Actions\Sendy;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class SendyAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'sendy',
        'fields'   => [
            'api_key'   => 'value',
            'sendy_url' => 'sendy_url',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $apiKey = $integrationDetails->api_key ?: ($integrationDetails->value ?? '');
        $integId = $integrationData->id;

        if (
            empty($apiKey)
            || empty($fieldMap)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('api key, fields map are required for sendy api', 'bit-integrations'));
            LogHandler::save($integId, 'contact', 'validation', $error);

            return $error;
        }
        $recordApiHelper = new SendyService($integId);
        $hubspotResponse = $recordApiHelper->execute(
            $integId,
            $integrationDetails,
            $fieldValues,
            $fieldMap,
            $apiKey
        );
        if (is_wp_error($hubspotResponse)) {
            return $hubspotResponse;
        }

        return $hubspotResponse;
    }
}
