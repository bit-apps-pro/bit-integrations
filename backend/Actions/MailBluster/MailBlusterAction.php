<?php

namespace BitApps\Integrations\Actions\MailBluster;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailBlusterAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mailbluster',
        'fields'   => [
            'auth_token' => 'value',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $selectedTags = $integrationDetails->selectedTags;
        $fieldMap = $integrationDetails->field_map;
        $subscribed = $integrationDetails->subscribed;

        if (
            empty($fieldMap)
            || empty($auth_token) || empty($subscribed)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'GetResponse'));
        }
        $recordApiHelper = new MailBlusterService($integrationDetails, $integId);
        $mailBlusterApiResponse = $recordApiHelper->execute(
            $selectedTags,
            $fieldValues,
            $fieldMap,
            $subscribed
        );

        if (is_wp_error($mailBlusterApiResponse)) {
            return $mailBlusterApiResponse;
        }

        return $mailBlusterApiResponse;
    }
}
