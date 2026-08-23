<?php

namespace BitApps\Integrations\Actions\Twilio;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    public static $apiBaseUri = 'https://api.twilio.com/2010-04-01';

    public $_integrationDetails;

    protected $_defaultHeader;

    public function __construct($integrationDetails, $sid, $token, $from_num)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_sid = $sid;
        $this->_token = $token;
        $this->_from_num = $from_num;
        $this->_defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$sid}:{$token}"),
            'Accept'        => '*/*',
            'verify'        => false,
            'Content-Type'  => 'application/x-www-form-urlencoded'
        ];
    }

    public function sendMessage($data)
    {
        $data['From'] = $this->_from_num;
        $apiEndpoint = self::$apiBaseUri . "/Accounts/{$this->_sid}/Messages.json";

        return HttpHelper::post($apiEndpoint, $data, $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->twilioField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function executeRecordApi($integId, $fieldValues, $fieldMap, $integrationDetails)
    {
        $finalData = Common::replaceFieldWithValue($integrationDetails->body, $fieldValues);
        $recipientNumber = Common::replaceFieldWithValue($integrationDetails->to, $fieldValues);
        $messagesBody = str_replace(['<p>', '</p>'], ' ', $finalData);
        $data = [
            'To'   => $recipientNumber,
            'Body' => $messagesBody
        ];
        $apiResponse = $this->sendMessage($data);

        if ((property_exists($apiResponse, 'status') && $apiResponse->code == 400) || property_exists($apiResponse, 'code')) {
            LogHandler::save($integId, wp_json_encode(['type' => 'twilio sms sending', 'type_name' => 'sms sent']), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => 'wilio sms sending', 'type_name' => 'sms sent']), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
