<?php

namespace BitApps\Integrations\Actions\ConstantContact;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class ConstantContactAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'constantcontact',
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
        $tokenDetails = ConstantContactHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $authToken = $tokenDetails->access_token ?? '';
        $listIds = $integrationDetails->list_ids;
        $tagIds = $integrationDetails->tag_ids;
        $fieldMap = $integrationDetails->field_map;
        $source_type = $integrationDetails->source_type;
        $addressFields = $integrationDetails->address_field;
        $phoneFields = $integrationDetails->phone_field;
        $addressType = $integrationDetails->address_type;
        $phoneType = $integrationDetails->phone_type;
        $update = $integrationDetails->actions->update ?? false;

        if (empty($fieldMap) || empty($authToken)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'Constant Contact'));
        }

        if (!$isConnectionAuth && ConstantContactHelper::isTokenExpired($tokenDetails)) {
            $newTokenDetails = ConstantContactHelper::_refreshAccessToken((object) [
                'clientId'     => $integrationDetails->clientId ?? '',
                'clientSecret' => $integrationDetails->clientSecret ?? '',
                'tokenDetails' => $tokenDetails
            ]);

            if ($newTokenDetails) {
                ConstantContactHelper::_saveRefreshedToken($integId, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
                $integrationDetails->tokenDetails = $newTokenDetails;
            } else {
                LogHandler::save($integId, 'token', 'error', __('Failed to refresh access token', 'bit-integrations'));

                return;
            }
        }

        $recordApiHelper = new ConstantContactService($integrationDetails, $integId);

        $constantContactApiResponse = $recordApiHelper->execute(
            $listIds,
            $tagIds,
            $source_type,
            $fieldValues,
            $fieldMap,
            $addressFields,
            $phoneFields,
            $addressType,
            $phoneType,
            $update
        );

        if (is_wp_error($constantContactApiResponse)) {
            return $constantContactApiResponse;
        }

        return $constantContactApiResponse;
    }
}
