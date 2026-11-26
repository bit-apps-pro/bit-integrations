<?php

namespace BitApps\Integrations\Actions\Dropbox;

use BitApps\Integrations\Actions\Dropbox\DropboxService as DropboxRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class DropboxAction
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

    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
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
        $tokenDetails = DropboxHelper::normalizeConnectionToken($integrationDetails->tokenDetails ?? null);
        $oldToken = $tokenDetails->access_token ?? '';

        if (!$isConnectionAuth) {
            $tokenDetails = DropboxHelper::tokenExpiryCheck($tokenDetails, $integrationDetails->clientId ?? '', $integrationDetails->clientSecret ?? '');
        }

        if (empty($tokenDetails) || empty($tokenDetails->access_token)) {
            // translators: %s: Service name
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'dropbox', 'type_name' => 'file_upload']), 'error', wp_sprintf(__('Not Authorization By %s', 'bit-integrations'), 'Dropbox'));

            return false;
        }

        if (!$isConnectionAuth && $tokenDetails->access_token !== $oldToken) {
            DropboxHelper::saveRefreshedToken($this->integrationID, $tokenDetails);
        }

        if (empty($fieldMap)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Required fields not mapped', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        return (new DropboxRecordApiHelper($tokenDetails->access_token))->executeRecordApi($this->integrationID, $fieldValues, $fieldMap, $actions);
    }
}
