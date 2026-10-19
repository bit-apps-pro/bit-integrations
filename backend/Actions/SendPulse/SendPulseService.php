<?php

namespace BitApps\Integrations\Actions\SendPulse;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class SendPulseService
{
    private $_integrationID;

    private $_integrationDetails;

    private $_defaultHeader;

    public function __construct($integrationDetails, $integId, $access_token)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_defaultHeader = [
            'Authorization' => 'Bearer ' . $access_token,
            'Content-Type'  => 'application/json'
        ];
    }

    public function addContact($selectedList, $finalData)
    {
        $apiEndpoints = "https://api.sendpulse.com/addressbooks/{$selectedList}/emails";

        $variables = array_filter($finalData, fn ($key) => $key !== 'email', ARRAY_FILTER_USE_KEY);

        $body = [
            'emails' => [
                [
                    'email'     => $finalData['email'],
                    'variables' => $variables
                ]
            ]
        ];

        return HttpHelper::post($apiEndpoints, wp_json_encode($body), $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sendPulseField;

            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = $value->customValue;
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($selectedList, $fieldValues, $fieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        $apiResponse = $this->addContact($selectedList, $finalData);

        if ($apiResponse->result == true) {
            $res = ['message' => __('Contact Added Successfully', 'bit-integrations')];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'Contact added']), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'Adding Contact']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
