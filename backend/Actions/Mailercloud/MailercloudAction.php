<?php

namespace BitApps\Integrations\Actions\Mailercloud;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailercloudAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mailercloud',
        'fields'   => [
            'api_key' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $authKey = !empty($integrationDetails->api_key) ? $integrationDetails->api_key : (isset($integrationDetails->authKey) ? $integrationDetails->authKey : '');
        $listId = $integrationDetails->listId;
        $contactType = $integrationDetails->contactType;
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map)
             || empty($authKey)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Mailercloud'));
        }
        $recordApiHelper = new MailercloudService($integrationDetails, $integId);
        $mailercloudApiResponse = $recordApiHelper->execute(
            $listId,
            $contactType,
            $fieldValues,
            $field_map,
            $authKey
        );

        if (is_wp_error($mailercloudApiResponse)) {
            return $mailercloudApiResponse;
        }

        return $mailercloudApiResponse;
    }
}
