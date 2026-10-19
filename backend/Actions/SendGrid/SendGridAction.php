<?php

namespace BitApps\Integrations\Actions\SendGrid;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class SendGridAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BEARER_TOKEN,
        'slug'     => 'sendgrid',
        'fields'   => [
            'apiKey' => 'token',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $apiKey = $integrationDetails->apiKey;
        $selectedLists = $integrationDetails->selectedLists;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap) || empty($apiKey)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'SendGrid'));
        }

        $recordApiHelper = new SendGridService($integrationDetails, $integId);
        $sendGridApiResponse = $recordApiHelper->execute(
            $selectedLists,
            $fieldValues,
            $fieldMap
        );

        if (is_wp_error($sendGridApiResponse)) {
            return $sendGridApiResponse;
        }

        return $sendGridApiResponse;
    }
}
