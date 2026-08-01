<?php

/**
 * LionDesk Integration
 */

namespace BitApps\Integrations\Actions\LionDesk;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use WP_Error;

/**
 * Provide functionality for LionDesk integration
 */
class LionDeskController
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

    public function getCustomFields($fieldsRequestParams)
    {
        $tokenDetails = self::normalizeConnectionToken($fieldsRequestParams->tokenDetails ?? $fieldsRequestParams->token_details ?? null);
        $isConnectionAuth = !empty($fieldsRequestParams->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($oldToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $refreshedToken = self::_refreshAccessToken((object) [
                'clientId'     => $fieldsRequestParams->clientId ?? $fieldsRequestParams->client_id ?? '',
                'clientSecret' => $fieldsRequestParams->clientSecret ?? $fieldsRequestParams->client_secret ?? '',
                'redirectURI'  => $fieldsRequestParams->redirectURI ?? $fieldsRequestParams->redirect_uri ?? '',
                'tokenDetails' => $tokenDetails,
            ]);

            if (!$refreshedToken) {
                wp_send_json_error(__('Failed to refresh access token', 'bit-integrations'), 400);
            }
            $tokenDetails = $refreshedToken;
        }

        $apiEndpoint = $this->apiEndpoint . '/custom-fields';
        $headers = $this->setHeaders($tokenDetails->access_token);
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);

        if (!isset($apiResponse) || isset($apiResponse->message) && !isset($apiResponse->data)) {
            wp_send_json_error($apiResponse->message ?? __('Custom field fetching failed', 'bit-integrations'), 400);
        }

        $customFields = [];
        if (!empty($apiResponse->data)) {
            foreach ($apiResponse->data as $customField) {
                $customFields[] = [
                    'key'   => $customField->id,
                    'label' => $customField->name,
                ];
            }
        }

        if (!$isConnectionAuth && $oldToken !== ($tokenDetails->access_token ?? '') && !empty($fieldsRequestParams->id)) {
            self::saveRefreshedToken($fieldsRequestParams->id, $tokenDetails);
        }

        wp_send_json_success(
            [
                'customFields' => $customFields,
                'tokenDetails' => $tokenDetails,
            ],
            200
        );
    }

    public function getAllTags($fieldsRequestParams)
    {
        $tokenDetails = self::normalizeConnectionToken($fieldsRequestParams->tokenDetails ?? $fieldsRequestParams->token_details ?? null);
        $isConnectionAuth = !empty($fieldsRequestParams->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($oldToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $refreshedToken = self::_refreshAccessToken((object) [
                'clientId'     => $fieldsRequestParams->clientId ?? $fieldsRequestParams->client_id ?? '',
                'clientSecret' => $fieldsRequestParams->clientSecret ?? $fieldsRequestParams->client_secret ?? '',
                'redirectURI'  => $fieldsRequestParams->redirectURI ?? $fieldsRequestParams->redirect_uri ?? '',
                'tokenDetails' => $tokenDetails,
            ]);

            if (!$refreshedToken) {
                wp_send_json_error(__('Failed to refresh access token', 'bit-integrations'), 400);
            }
            $tokenDetails = $refreshedToken;
        }

        $apiEndpoint = $this->apiEndpoint . '/tags';
        $headers = $this->setHeaders($tokenDetails->access_token);
        $apiResponse = HttpHelper::get($apiEndpoint, null, $headers);

        if (!isset($apiResponse) || isset($apiResponse->message) && !isset($apiResponse->data)) {
            wp_send_json_error($apiResponse->message ?? __('Tags fetching failed', 'bit-integrations'), 400);
        }

        $tags = [];
        if (!empty($apiResponse->data)) {
            foreach ($apiResponse->data as $tag) {
                $tags[] = [
                    'tag' => $tag->content
                ];
            }
        }

        if (!$isConnectionAuth && $oldToken !== ($tokenDetails->access_token ?? '') && !empty($fieldsRequestParams->id)) {
            self::saveRefreshedToken($fieldsRequestParams->id, $tokenDetails);
        }

        wp_send_json_success(
            [
                'tags'         => $tags,
                'tokenDetails' => $tokenDetails,
            ],
            200
        );
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $fieldMap = $integrationDetails->field_map;
        $actionName = $integrationDetails->actionName;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($fieldMap) || empty($oldToken) || empty($actionName)) {
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'LionDesk'));
        }

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $tokenDetails = self::_refreshAccessToken((object) [
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
            self::saveRefreshedToken($integId, $tokenDetails);
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId, $tokenDetails);
        $lionDeskApiResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $actionName);

        if (is_wp_error($lionDeskApiResponse)) {
            return $lionDeskApiResponse;
        }

        return $lionDeskApiResponse;
    }

    /**
     * Helps to refresh LionDesk access_token
     *
     * @param object $apiData Contains required data for refresh access token
     *
     * @return object|false $tokenDetails API token details
     */
    protected static function _refreshAccessToken($apiData)
    {
        if (empty($apiData->clientId)
            || empty($apiData->clientSecret)
            || empty($apiData->tokenDetails)
            || empty($apiData->tokenDetails->refresh_token)
        ) {
            return false;
        }

        $apiEndpoint = 'https://api-v2.liondesk.com/oauth2/token';
        $requestParams = [
            'refresh_token' => $apiData->tokenDetails->refresh_token,
            'client_id'     => $apiData->clientId,
            'client_secret' => $apiData->clientSecret,
            'grant_type'    => 'refresh_token',
        ];

        if (!empty($apiData->redirectURI)) {
            $requestParams['redirect_uri'] = $apiData->redirectURI;
        }

        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }

        $tokenDetails = $apiData->tokenDetails;
        $tokenDetails->access_token = $apiResponse->access_token ?? $tokenDetails->access_token;
        $tokenDetails->token_type = $apiResponse->token_type ?? ($tokenDetails->token_type ?? 'Bearer');
        $tokenDetails->expires_in = $apiResponse->expires_in ?? ($tokenDetails->expires_in ?? 0);
        $tokenDetails->expires = $apiResponse->expires ?? ($tokenDetails->expires ?? '');
        $tokenDetails->refresh_token = $apiResponse->refresh_token ?? $tokenDetails->refresh_token;
        $tokenDetails->generates_on = time();
        $tokenDetails->generated_at = $tokenDetails->generates_on;

        return $tokenDetails;
    }

    private static function isTokenExpired($tokenDetails)
    {
        if (empty($tokenDetails)) {
            return true;
        }

        if (!empty($tokenDetails->expires)) {
            $expiresOn = strtotime($tokenDetails->expires);
            if ($expiresOn && $expiresOn < time()) {
                return true;
            }
        }

        $generatedOn = (int) ($tokenDetails->generates_on ?? $tokenDetails->generated_at ?? 0);
        $expiresIn = (int) ($tokenDetails->expires_in ?? 0);

        return $generatedOn > 0 && $expiresIn > 0 && ($generatedOn + ($expiresIn - 300)) < time();
    }

    private static function normalizeConnectionToken($token)
    {
        if (!\is_object($token)) {
            $token = (object) [];
        }

        if (empty($token->generates_on) && !empty($token->generated_at)) {
            $token->generates_on = (int) $token->generated_at;
        }

        return $token;
    }

    private static function saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $lionDeskDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($lionDeskDetails)) {
            return;
        }

        $newDetails = json_decode($lionDeskDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }

    private function setHeaders($access_token)
    {
        return [
            'Authorization' => "Bearer {$access_token}",
            'Content-Type'  => 'application/json'
        ];
    }
}
