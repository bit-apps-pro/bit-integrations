<?php

namespace BitApps\Integrations\Actions\OneDrive;

use BitApps\Integrations\Actions\OneDrive\OneDriveService as OneDriveRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;

class OneDriveAction
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
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = OneDriveHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $oldToken = $tokenDetails->access_token ?? '';

        if (!$isConnectionAuth) {
            $tokenDetails = OneDriveHelper::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId ?? '', $integrationDetails->clientSecret ?? '');
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'oneDrive', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'OneDrive'));

            return false;
        }
        $parentId = $integrationData->flow_details->folderMap[1];
        $fieldMap = null;

        if (!$isConnectionAuth && $tokenDetails->access_token !== $oldToken) {
            OneDriveHelper::saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        (new OneDriveRecordApiHelper($tokenDetails->access_token))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions, $folderId, $parentId);

        return true;
    }
}
