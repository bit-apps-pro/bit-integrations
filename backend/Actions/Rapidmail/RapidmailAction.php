<?php

namespace BitApps\Integrations\Actions\Rapidmail;

use BitApps\Integrations\Actions\Rapidmail\RapidmailService as RapidmailRecordApiHelper;
use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

final class RapidmailAction
{
    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'rapidmail',
        'fields'   => [
            'username' => 'username',
            'password' => 'password',
        ],
    ];

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $defaultDataConf = $integrationDetails->default;
        $username = $integrationDetails->username;
        $password = $integrationDetails->password;
        $recipientLists = $defaultDataConf->recipientlists;
        $actions = $integrationDetails->actions;

        if (
            empty($username)
            || empty($password)
            || empty($fieldMap)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('username, password, fields are required for rapidmail api', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }
        if (empty($recipientLists)) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('Recipient List are required for rapidmail api', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'record', 'validation', $error);

            return $error;
        }

        $recordApiHelper = new RapidmailRecordApiHelper($integrationDetails, $username, $password);
        $rapidmailResponse = $recordApiHelper->executeRecordApi(
            $this->_integrationID,
            $defaultDataConf,
            $recipientLists,
            $fieldValues,
            $fieldMap,
            $actions
        );
        if (is_wp_error($rapidmailResponse)) {
            return $rapidmailResponse;
        }

        return $rapidmailResponse;
    }
}
