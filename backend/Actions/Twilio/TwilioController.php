<?php

/**
 * Rapidmail Integration
 */

namespace BitApps\Integrations\Actions\Twilio;

use BitApps\Integrations\Authorization\AuthorizationType;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

final class TwilioController
{
    public static $apiBaseUri = 'https://api.twilio.com/2010-04-01';

    public static array $authConfig = [
        'authType' => AuthorizationType::BASIC_AUTH,
        'slug'     => 'twilio',
        'fields'   => [
            'sid'      => 'username',
            'token'    => 'password',
            'from_num' => 'from_num',
        ],
    ];

    protected $_defaultHeader;

    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $fieldMap = $integrationDetails->field_map;
        $sid = $integrationDetails->sid;
        $token = $integrationDetails->token;
        $from_num = $integrationDetails->from_num;

        if (
            empty($sid)
            || empty($token)
            || empty($from_num)
            || empty($fieldMap)
        ) {
            $error = new WP_Error('REQ_FIELD_EMPTY', __('SID, Auth Token,From Number and mapping fields are required for rapidmail api', 'bit-integrations'));
            LogHandler::save($this->_integrationID, 'twilio sms sending', 'validation', $error);

            return $error;
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $sid, $token, $from_num);

        return $recordApiHelper->executeRecordApi(
            $this->_integrationID,
            $fieldValues,
            $fieldMap,
            $integrationDetails
        );
    }
}
