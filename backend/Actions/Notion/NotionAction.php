<?php

namespace BitApps\Integrations\Actions\Notion;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class NotionAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'notion',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $databaseId = $integrationDetails->databaseId;
        $notionFields = $integrationDetails->notionFields;
        $tokenDetails = $integrationDetails->tokenDetails ?? null;
        $accessToken = $tokenDetails->access_token ?? ($integrationDetails->access_token ?? '');
        $tokenType = $tokenDetails->token_type ?? ($integrationDetails->token_type ?? 'Bearer');
        $field_map = $integrationDetails->field_map;

        if (
            empty($field_map) || empty($accessToken)
        ) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'notion'));
        }

        $recordApiHelper = new NotionService($integrationDetails, $integId);

        $notionApiResponse = $recordApiHelper->execute(
            $databaseId,
            $accessToken,
            $tokenType,
            $notionFields,
            $fieldValues,
            $field_map,
        );

        if (is_wp_error($notionApiResponse)) {
            return $notionApiResponse;
        }

        return $notionApiResponse;
    }
}
