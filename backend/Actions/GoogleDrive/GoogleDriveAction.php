<?php

namespace BitApps\Integrations\Actions\GoogleDrive;

use BitApps\Integrations\Actions\GoogleDrive\GoogleDriveService as GoogleDriveRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class GoogleDriveAction
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

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $actions = $integrationDetails->actions;
        $fieldMap = $integrationDetails->field_map;
        $isConnectionAuth = !empty($integrationDetails->connection_id);
        $tokenDetails = GoogleDriveHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);

        if (empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'googleDrive', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'GoogleDrive'));

            return false;
        }

        $oldToken = $tokenDetails->access_token;

        if (!$isConnectionAuth) {
            $tokenDetails = GoogleDriveHelper::tokenExpiryCheck(
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
                GoogleDriveHelper::saveRefreshedToken($this->integrationID, $tokenDetails);
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
}
