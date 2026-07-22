<?php

namespace BitApps\Integrations\Actions\OneDrive;

use BitApps\Integrations\Actions\OneDrive\RecordApiHelper as OneDriveRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;

class OneDriveController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'onedrive',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public static function getAllFolders($queryParams)
    {
        $tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);
        $clientId = $queryParams->clientId ?? '';
        $clientSecret = $queryParams->clientSecret ?? '';

        if (empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $oldToken = $tokenDetails->access_token;
        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $clientId, $clientSecret);
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Authorization failed', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && !empty($queryParams->flowID) && $tokenDetails->access_token !== $oldToken) {
            self::saveRefreshedToken($queryParams->flowID, $tokenDetails);
        }

        $folders = self::getOneDriveFoldersList($tokenDetails->access_token);
        $foldersOnly = $folders->value;

        $data = [];
        if (\is_array($foldersOnly)) {
            foreach ($foldersOnly as $folder) {
                if (property_exists($folder, 'folder')) {
                    $data[] = $folder;
                }
            }
        }
        $response['oneDriveFoldersList'] = $data;
        $response['tokenDetails'] = $tokenDetails;
        wp_send_json_success($response, 200);
    }

    public static function getOneDriveFoldersList($token)
    {
        $headers = [
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json;',
            'Authorization' => 'bearer ' . $token,
        ];
        $apiEndpoint = 'https://api.onedrive.com/v1.0/drive/root/children';
        $apiResponse = HttpHelper::get($apiEndpoint, [], $headers);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }

        return $apiResponse;
    }

    public static function singleOneDriveFolderList($queryParams)
    {
        $tokenDetails = self::normalizeConnectionToken($queryParams->tokenDetails ?? null);
        $isConnectionAuth = !empty($queryParams->connection_id);
        $clientId = $queryParams->clientId ?? '';
        $clientSecret = $queryParams->clientSecret ?? '';

        if (empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $ids = explode('!', $queryParams->folder);
        $oldToken = $tokenDetails->access_token;
        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $clientId, $clientSecret);
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Authorization failed', 'bit-integrations'), 400);
        }

        if (!$isConnectionAuth && !empty($queryParams->flowID) && $tokenDetails->access_token !== $oldToken) {
            self::saveRefreshedToken($queryParams->flowID, $tokenDetails);
        }

        $headers = [
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json;',
            'Authorization' => 'bearer ' . $tokenDetails->access_token,
        ];
        $apiEndpoint = 'https://api.onedrive.com/v1.0/drives/' . $ids[0] . '/items/' . $queryParams->folder . '/children';
        $apiResponse = HttpHelper::get($apiEndpoint, [], $headers);
        $foldersOnly = $apiResponse->value;
        $data = [];
        if (\is_array($foldersOnly)) {
            foreach ($foldersOnly as $folder) {
                if (property_exists($folder, 'folder')) {
                    $data[] = $folder;
                }
            }
        }
        $response['folders'] = $data;
        $response['tokenDetails'] = $tokenDetails;
        wp_send_json_success($response, 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        if (empty($integrationData->flow_details->tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'oneDrive', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'OneDrive'));

            return false;
        }

        $integrationDetails = $integrationData->flow_details;
        $actions = $integrationDetails->actions;
        $folderId = $integrationDetails->folder;
        // $fieldMap = $integrationDetails->field_map;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $oldToken = $tokenDetails->access_token ?? '';

        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId ?? '', $integrationDetails->clientSecret ?? '');
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'oneDrive', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'OneDrive'));

            return false;
        }
        // folderMap need check
        $parentId = $integrationData->flow_details->folderMap[1];
        $fieldMap = null;

        if (!$isConnectionAuth && $tokenDetails->access_token !== $oldToken) {
            self::saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        (new OneDriveRecordApiHelper($tokenDetails->access_token))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions, $folderId, $parentId);

        return true;
    }

    private static function tokenExpiryCheck($token, $clientId, $clientSecret)
    {
        if (!$token) {
            return false;
        }

        $generatedOn = !empty($token->generates_on) ? (int) $token->generates_on : (int) ($token->generated_at ?? 0);

        if ($generatedOn > 0 && ($generatedOn + (55 * 60)) < time()) {
            $refreshToken = self::refreshToken($token->refresh_token, $clientId, $clientSecret);
            if (is_wp_error($refreshToken) || !empty($refreshToken->error)) {
                return false;
            }
            $token->access_token = $refreshToken->access_token;
            $token->expires_in = $refreshToken->expires_in;
            $token->generates_on = $refreshToken->generates_on;
            $token->generated_at = $refreshToken->generated_at;
            $token->refresh_token = $refreshToken->refresh_token;
        }

        return $token;
    }

    private static function refreshToken($refresh_token, $clientId, $clientSecret)
    {
        $body = [
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'grant_type'    => 'refresh_token',
            'refresh_token' => $refresh_token,
        ];

        $apiEndpoint = 'https://login.live.com/oauth20_token.srf';
        $apiResponse = HttpHelper::post($apiEndpoint, $body);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }
        $token = $apiResponse;
        $token->generates_on = time();
        $token->generated_at = $token->generates_on;

        return $token;
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
        $googleDriveDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($googleDriveDetails)) {
            return;
        }

        $newDetails = json_decode($googleDriveDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
