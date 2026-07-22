<?php

/**
 * Constant Contact Integration
 */

namespace BitApps\Integrations\Actions\ConstantContact;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

/**
 * Provide functionality for Constant Contact integration
 */
class ConstantContactController
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

    protected $_defaultHeader;

    public static function refreshList($queryParams)
    {
        $tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($oldToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $refreshedToken = self::_refreshAccessToken((object) [
                'clientId'     => $queryParams->clientId ?? '',
                'clientSecret' => $queryParams->clientSecret ?? '',
                'tokenDetails' => $tokenDetails,
            ]);

            if (!$refreshedToken) {
                wp_send_json_error(__('Failed to refresh access token', 'bit-integrations'), 400);
            }

            $tokenDetails = $refreshedToken;
        }

        $apiEndpoint = 'https://api.cc.email/v3/contact_lists';
        $authorizationHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $allList = [];
        if (!is_wp_error($apiResponse) && empty($apiResponse->response->error)) {
            $contactLists = $apiResponse->lists;
            foreach ($contactLists as $contactList) {
                $allList[] = [
                    'listId'   => $contactList->list_id,
                    'listName' => $contactList->name
                ];
            }
            uksort($allList, 'strnatcasecmp');
        } else {
            wp_send_json_error($apiResponse->response->error->message ?? __('List fetch failed', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && $oldToken !== ($tokenDetails->access_token ?? '') && !empty($queryParams->integId)) {
            self::_saveRefreshedToken($queryParams->integId, $tokenDetails);
        }

        wp_send_json_success(
            [
                'contactList' => $allList,
                'tokenDetails' => $tokenDetails
            ],
            200
        );
    }

    public static function refreshTags($queryParams)
    {
        $tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($oldToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $refreshedToken = self::_refreshAccessToken((object) [
                'clientId'     => $queryParams->clientId ?? '',
                'clientSecret' => $queryParams->clientSecret ?? '',
                'tokenDetails' => $tokenDetails,
            ]);

            if (!$refreshedToken) {
                wp_send_json_error(__('Failed to refresh access token', 'bit-integrations'), 400);
            }

            $tokenDetails = $refreshedToken;
        }

        $apiEndpoint = 'https://api.cc.email/v3/contact_tags';
        $authorizationHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);

        $allTag = [];
        if (!is_wp_error($apiResponse) && empty($apiResponse->response->error)) {
            $contactTags = $apiResponse->tags;
            foreach ($contactTags as $contactTag) {
                $allTag[] = [
                    'tagId'   => $contactTag->tag_id,
                    'tagName' => $contactTag->name
                ];
            }
            uksort($allTag, 'strnatcasecmp');
        } else {
            wp_send_json_error($apiResponse->response->error->message ?? __('Tag fetch failed', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && $oldToken !== ($tokenDetails->access_token ?? '') && !empty($queryParams->integId)) {
            self::_saveRefreshedToken($queryParams->integId, $tokenDetails);
        }

        wp_send_json_success(
            [
                'contactTag' => $allTag,
                'tokenDetails' => $tokenDetails
            ],
            200
        );
    }

    public static function getCustomFields($queryParams)
    {
        $tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);
        $oldToken = $tokenDetails->access_token ?? '';

        if (empty($oldToken)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $refreshedToken = self::_refreshAccessToken((object) [
                'clientId'     => $queryParams->clientId ?? '',
                'clientSecret' => $queryParams->clientSecret ?? '',
                'tokenDetails' => $tokenDetails,
            ]);

            if (!$refreshedToken) {
                wp_send_json_error(__('Failed to refresh access token', 'bit-integrations'), 400);
            }

            $tokenDetails = $refreshedToken;
        }

        $apiEndpoint = 'https://api.cc.email/v3/contact_custom_fields';
        $authorizationHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $apiResponse = HttpHelper::get($apiEndpoint, null, $authorizationHeader);
        $allCFields = [];
        if (!is_wp_error($apiResponse) && empty($apiResponse->response->error)) {
            $customFields = $apiResponse->custom_fields;
            foreach ($customFields as $cField) {
                $allCFields[] = [
                    'label'    => $cField->label,
                    'key'      => 'custom-' . $cField->custom_field_id,
                    'required' => false
                ];
            }
            uksort($allCFields, 'strnatcasecmp');
        } else {
            wp_send_json_error($apiResponse->response->error->message ?? __('Custom fields fetch failed', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && $oldToken !== ($tokenDetails->access_token ?? '') && !empty($queryParams->integId)) {
            self::_saveRefreshedToken($queryParams->integId, $tokenDetails);
        }

        wp_send_json_success(
            [
                'customFields' => $allCFields,
                'tokenDetails' => $tokenDetails
            ],
            200
        );
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
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

        if (!$isConnectionAuth && self::isTokenExpired($tokenDetails)) {
            $newTokenDetails = self::_refreshAccessToken((object) [
                'clientId'     => $integrationDetails->clientId ?? '',
                'clientSecret' => $integrationDetails->clientSecret ?? '',
                'tokenDetails' => $tokenDetails
            ]);

            if ($newTokenDetails) {
                self::_saveRefreshedToken($integId, $newTokenDetails);
                $tokenDetails = $newTokenDetails;
                $integrationDetails->tokenDetails = $newTokenDetails;
            } else {
                LogHandler::save($integId, 'token', 'error', __('Failed to refresh access token', 'bit-integrations'));

                return;
            }
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

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

    protected static function _refreshAccessToken($apiData)
    {
        if (empty($apiData->tokenDetails) || empty($apiData->tokenDetails->refresh_token)) {
            return false;
        }

        $clientId = $apiData->clientId ?? ($apiData->tokenDetails->client_id ?? '');
        $clientSecret = $apiData->clientSecret ?? ($apiData->tokenDetails->client_secret ?? '');
        if (empty($clientId) || empty($clientSecret)) {
            return false;
        }

        $tokenDetails = $apiData->tokenDetails;
        $apiEndpoint = 'https://authz.constantcontact.com/oauth2/default/v1/token';
        $requestParams = [
            'grant_type'    => 'refresh_token',
            'refresh_token' => $tokenDetails->refresh_token,
        ];

        $auth = $clientId . ':' . $clientSecret;
        $credentials = base64_encode($auth);
        $authorizationHeader['Authorization'] = 'Basic ' . $credentials;

        $apiResponse = HttpHelper::post($apiEndpoint, $requestParams, $authorizationHeader);

        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $tokenDetails->generates_on = time();
        $tokenDetails->generated_at = $tokenDetails->generates_on;
        $tokenDetails->access_token = $apiResponse->access_token ?? $tokenDetails->access_token;
        $tokenDetails->refresh_token = $apiResponse->refresh_token ?? $tokenDetails->refresh_token;
        $tokenDetails->token_type = $apiResponse->token_type ?? ($tokenDetails->token_type ?? 'Bearer');
        $tokenDetails->expires_in = $apiResponse->expires_in ?? ($tokenDetails->expires_in ?? 0);

        return $tokenDetails;
    }

    private static function isTokenExpired($tokenDetails)
    {
        if (empty($tokenDetails)) {
            return true;
        }

        $generatedOn = (int) ($tokenDetails->generates_on ?? $tokenDetails->generated_at ?? 0);
        $expiresIn = (int) ($tokenDetails->expires_in ?? 0);

        if ($generatedOn <= 0) {
            return true;
        }

        if ($expiresIn > 0) {
            return ($generatedOn + \max($expiresIn - 300, 0)) < time();
        }

        return ($generatedOn + (1435 * 60)) < time();
    }

    private static function normalizeConnectionToken($token)
    {
        if (!\is_object($token)) {
            $token = (object) [];
        }

        if (empty($token->generates_on) && !empty($token->generated_at)) {
            $token->generates_on = (int) $token->generated_at;
        }

        if (empty($token->generated_at) && !empty($token->generates_on)) {
            $token->generated_at = (int) $token->generates_on;
        }

        return $token;
    }

    private static function _saveRefreshedToken($integrationID, $tokenDetails)
    {
        if (empty($integrationID)) {
            return;
        }

        $flow = new FlowController();
        $cContactDetails = $flow->get(['id' => $integrationID]);

        if (is_wp_error($cContactDetails)) {
            return;
        }
        $newDetails = json_decode($cContactDetails[0]->flow_details);

        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
