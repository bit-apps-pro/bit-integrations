<?php

namespace BitApps\Integrations\Actions\MailerLite;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class MailerLiteAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::API_KEY,
        'slug'     => 'mailerlite',
        'fields'   => [
            'auth_token' => 'value',
            'version'    => 'version',
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $auth_token = $integrationDetails->auth_token;
        $version = $integrationDetails->version;
        $fieldMap = $integrationDetails->field_map ?? '';
        $type = $integrationDetails->mailer_lite_type ?? '';
        $actions = $integrationDetails->actions ?? '';
        $action = $integrationDetails->action ?? '';

        if (
            empty($fieldMap)
            || empty($auth_token)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'MailerLite'));
        }
        $recordApiHelper = new MailerLiteService($auth_token, $integrationDetails, $integId, $actions, $version);
        $mailerliteApiResponse = $recordApiHelper->execute(
            $integrationDetails,
            $type,
            $fieldValues,
            $fieldMap,
            $auth_token,
            $action
        );

        if (is_wp_error($mailerliteApiResponse)) {
            return $mailerliteApiResponse;
        }

        return $mailerliteApiResponse;
    }
}
