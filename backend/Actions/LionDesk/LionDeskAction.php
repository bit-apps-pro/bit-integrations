<?php

namespace BitApps\Integrations\Actions\LionDesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use WP_Error;

class LionDeskAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'liondesk',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires', 'expires_in', 'generated_at']],
        ],
    ];

    protected $apiEndpoint;

    public function __construct()
    {
        $this->apiEndpoint = 'https://api-v2.liondesk.com/';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $tokenDetails = LionDeskHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($fieldMap) || empty($oldToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'LionDesk'));
        }

        if (!$isConnectionAuth && LionDeskHelper::isTokenExpired($tokenDetails)) {
            $tokenDetails = LionDeskHelper::_refreshAccessToken((object) [
                'clientId'     => $integrationDetails->clientId ?? '',
                'clientSecret' => $integrationDetails->clientSecret ?? '',
                'redirectURI'  => $integrationDetails->redirectURI ?? '',
                'tokenDetails' => $tokenDetails,
            ]);

            if (!$tokenDetails || empty($tokenDetails->access_token)) {
                return new WP_Error('AUTH_FAILED', __('Failed to refresh access token', 'bit-integrations'));
            }
        }

        if (!$isConnectionAuth && $oldToken !== ($tokenDetails->access_token ?? '')) {
            LionDeskHelper::saveRefreshedToken($integId, $tokenDetails);
        }

        $recordApiHelper = new LionDeskService($integrationDetails, $integId, $tokenDetails);
        $lionDeskApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($lionDeskApiResponse)) {
            return $lionDeskApiResponse;
        }

        return $lionDeskApiResponse;
    }
}
