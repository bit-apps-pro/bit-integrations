<?php

/**
 * Rapidmail Integration
 */

namespace BitApps\Integrations\Actions\Rapidmail;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Actions\Rapidmail\RecordApiHelper as RapidmailRecordApiHelper;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

final class RapidmailController
{
    public static $apiBaseUri = 'https://apiv3.emailsys.net/v1';

    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'rapidmail',
        'fields'   => [
            'username' => 'username',
            'password' => 'password',
        ],
    ];

    protected $_defaultHeader;

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    /**
     * Process request for getting recipientlists from rapidmail
     *
     * @param $queryParams Mandatory params to get recipients
     *
     * @return JSON rapidmailmail recipientlists data
     */
    public static function getAllRecipients($queryParams)
    {
        if (
            empty($queryParams->username)
            || empty($queryParams->password)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$queryParams->username}:{$queryParams->password}"),
            'Accept'        => '*/*',
            'verify'        => false
        ];
        $recipientApiEndpoint = self::$apiBaseUri . '/recipientlists';
        $apiResponse = HttpHelper::get($recipientApiEndpoint, null, $header);
        $tempRecipient = $apiResponse->_embedded->recipientlists;
        $data = [];

        foreach ($tempRecipient as $list) {
            $data[] = (object) [
                'id'   => $list->id,
                'name' => $list->name
            ];
        }
        $response['recipientlists'] = $data;
        wp_send_json_success($response, 200);
    }

    public static function getAllFields($queryParams)
    {
        if (
            empty($queryParams->username)
            || empty($queryParams->password)
        ) {
            wp_send_json_error(
                __(
                    'Requested parameter is empty',
                    'bit-integrations'
                ),
                400
            );
        }
        $header = [
            'Authorization' => 'Basic ' . base64_encode("{$queryParams->username}:{$queryParams->password}"),
            'Accept'        => '*/*',
            'verify'        => false
        ];
        $recipientApiEndpoint = self::$apiBaseUri . '/recipientlists';
        $apiResponse = HttpHelper::get($recipientApiEndpoint, null, $header);
        $tempRecipient = $apiResponse->_embedded->recipientlists;
        $data = [];

        foreach ($tempRecipient as $list) {
            $data[] = (object) [
                'id'   => $list->id,
                'name' => $list->name
            ];
        }
        $response['recipientlists'] = $data;
        wp_send_json_success($response, 200);
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
