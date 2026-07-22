<?php

namespace BitApps\Integrations\Actions\GoogleDrive;

use BitApps\Integrations\Actions\GoogleDrive\RecordApiHelper as GoogleDriveRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class GoogleDriveController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'googledrive',
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
        $clientId = $queryParams->clientId ?? '';
        $clientSecret = $queryParams->clientSecret ?? '';
        $flowID = $queryParams->flowID ?? null;
        $isConnectionAuth = !empty($queryParams->connection_id);

        if (empty($tokenDetails->access_token) && !empty($queryParams->accessToken)) {
            $tokenDetails->access_token = $queryParams->accessToken;
            $tokenDetails->refresh_token = $queryParams->refreshToken ?? '';
        }

        if (empty($tokenDetails->access_token)) {
            wp_send_json_error(__('Requested parameter is empty', 'bit-integrations'), 400);
        }

        $oldToken = $tokenDetails->access_token;

        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $clientId, $clientSecret);

            if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
                wp_send_json_error(__('Authorization failed', 'bit-integrations'), 400);
            }

            if (!empty($flowID) && $tokenDetails->access_token !== $oldToken) {
                self::saveRefreshedToken($flowID, $tokenDetails);
            }
        }

        $folders = self::getGoogleDriveFoldersList($tokenDetails->access_token);

        $data = [];
        if (!empty($folders) && !empty($folders->files)) {
            $folders = self::getPathFromParentId($folders->files);
            if (\is_array($folders)) {
                foreach ($folders as $folder) {
                    $data[] = (object) [
                        'id'   => $folder->id,
                        'name' => $folder->name,
                    ];
                }
            }
        }

        $response['googleDriveFoldersList'] = $data;
        $response['tokenDetails'] = $tokenDetails;
        wp_send_json_success($response, 200);
    }

    public static function getGoogleDriveFoldersList($token)
    {
        $headers = [
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json;',
            'Authorization' => 'Bearer ' . $token,
        ];
        // for only root folder: and 'root' in parents
        $apiEndpoint = "https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name,parents)";
        $apiResponse = HttpHelper::get($apiEndpoint, [], $headers);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }

        return $apiResponse;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);

        if (empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'googleDrive', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleDrive'));

            return false;
        }

        $oldToken = $tokenDetails->access_token;

        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck(
                $tokenDetails,
                $integrationDetails->clientId ?? '',
                $integrationDetails->clientSecret ?? ''
            );

            if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
                // translators: %s: Service name
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'googleDrive', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleDrive'));

                return false;
            }

            if ($tokenDetails->access_token !== $oldToken) {
                self::saveRefreshedToken($this->integrationID, $tokenDetails);
            }
        }

        if (empty($fieldMap)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Required fields not mapped', 'bit-integrations'));
            LogHandler::save($this->integrationID, 'record', 'validation', $error);

            return $error;
        }

        (new GoogleDriveRecordApiHelper($tokenDetails->access_token))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions);

        return true;
    }

    protected static function getPathFromParentId($folders)
    {
        $newFolders = [];
        foreach ($folders as $folder) {
            $parentName = self::getParentName($folders, $folder->parents[0]);
            if (!empty($parentName)) {
                $folder->name = $parentName . ' > ' . $folder->name;
            }
            $newFolders[] = $folder;
        }

        return $newFolders;
    }

    protected static function getParentName($folders, $parentId)
    {
        $parentName = '';
        foreach ($folders as $folder) {
            if ($folder->id == $parentId) {
                $parentName = $folder->name;
                $tempName = self::getParentName($folders, $folder->parents[0]);
                if (!empty($tempName)) {
                    $parentName = $tempName . ' > ' . $parentName;
                }

                break;
            }
        }

        return $parentName;
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

            if (isset($refreshToken->access_token)) {
                $token->access_token = $refreshToken->access_token;
                $token->expires_in = $refreshToken->expires_in;
                $token->generates_on = $refreshToken->generates_on;
                $token->generated_at = $refreshToken->generated_at;
                $token->refresh_token = $refreshToken->refresh_token;
            }
        }

        return $token;
    }

    private static function refreshToken($refresh_token, $clientId, $clientSecret)
    {
        $body = [
            'grant_type'    => 'refresh_token',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $refresh_token,
        ];

        $apiEndpoint = 'https://oauth2.googleapis.com/token';
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
