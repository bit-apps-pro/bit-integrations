<?php

namespace BitApps\Integrations\Actions\Dropbox;

use BitApps\Integrations\Actions\Dropbox\RecordApiHelper as DropboxRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Flow\FlowController;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class DropboxController
{
    public static array $authConfig = [
        'authType' => AuthorizationType::OAUTH2,
        'slug'     => 'dropbox',
        'fields'   => [
            'clientId'     => 'client_id',
            'clientSecret' => 'client_secret',
            '__object'     => ['tokenDetails', ['access_token', 'refresh_token', 'token_type', 'expires_in', 'generated_at']],
        ],
    ];

    protected static $apiBaseUri = 'https://api.dropboxapi.com';

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

        $folders = self::getDropboxFoldersList($tokenDetails->access_token);
        $data = [];
        if ($folders->entries) {
            foreach ($folders->entries as $folder) {
                $folder = (array) $folder;
                if ($folder['.tag'] == 'folder') {
                    $data[] = (object) [
                        'name'       => $folder['name'],
                        'lower_path' => $folder['path_lower'],
                    ];
                }
            }
        }

        $response['dropboxFoldersList'] = $data;
        $response['tokenDetails'] = $tokenDetails;
        wp_send_json_success($response, 200);
    }

    public static function getDropboxFoldersList($token)
    {
        $headers = [
            'Content-Type'  => 'application/json; charset=utf-8',
            'Authorization' => 'Bearer ' . $token,
        ];
        $options = [
            'path'                           => '',
            'recursive'                      => true,
            'include_deleted'                => false,
            'include_mounted_folders'        => true,
            'include_non_downloadable_files' => true
        ];
        $options = wp_json_encode($options);

        $apiEndpoint = self::$apiBaseUri . '/2/files/list_folder';
        $apiResponse = HttpHelper::post($apiEndpoint, $options, $headers);
        if (is_wp_error($apiResponse) || !empty($apiResponse->error)) {
            return false;
        }

        return $apiResponse;
    }

    public function execute($integrationData, $fieldValues)
    {
        if (empty($integrationData->flow_details->tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'dropbox', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'Dropbox'));

            return false;
        }

        $integrationDetails = $integrationData->flow_details;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = self::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $oldToken = $tokenDetails->access_token ?? '';

        if (!$isConnectionAuth) {
            $tokenDetails = self::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId ?? '', $integrationDetails->clientSecret ?? '');
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'dropbox', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'Dropbox'));

            return false;
        }

        if (!$isConnectionAuth && $tokenDetails->access_token !== $oldToken) {
            self::saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        if (empty($fieldMap)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Required fields not mapped', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        return (new DropboxRecordApiHelper($tokenDetails->access_token))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions);
    }

    private static function tokenExpiryCheck($token, $clientId, $clientSecret)
    {
        if (!$token) {
            return false;
        }

        $generatedOn = !empty($token->generates_on) ? (int) $token->generates_on : (int) ($token->generated_at ?? 0);

        if (($generatedOn + $token->expires_in - 30) < time()) {
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
            'grant_type'    => 'refresh_token',
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $refresh_token,
        ];

        $apiEndpoint = self::$apiBaseUri . '/oauth2/token';
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
        $dropboxDetails = $flow->get(['id' => $integrationID]);
        if (is_wp_error($dropboxDetails)) {
            return;
        }

        $newDetails = json_decode($dropboxDetails[0]->flow_details);
        $newDetails->tokenDetails = $tokenDetails;
        $flow->update($integrationID, ['flow_details' => wp_json_encode($newDetails)]);
    }
}
