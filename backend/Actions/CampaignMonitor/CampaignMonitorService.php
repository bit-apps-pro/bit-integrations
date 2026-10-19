<?php

namespace BitApps\Integrations\Actions\CampaignMonitor;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class CampaignMonitorService
{
    private $_integrationID;

    private $_integrationDetails;

    private $_defaultHeader;

    private $baseUrl;

    public function __construct($integrationDetails, $integId, $apiKey)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->baseUrl = 'https://api.createsend.com/api/v3.3';
        $this->_defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:"),
            'Content-Type'  => 'application/json'
        ];
    }

    public function updateSubscriber($email, $finalData, $selectedList)
    {
        $apiEndpoints = $this->baseUrl . "/subscribers/{$selectedList}.json?email={$email}";

        return HttpHelper::request($apiEndpoints, 'PUT', $this->setSubscriberData($finalData), $this->_defaultHeader);
    }

    public function addSubscriber($selectedList, $finalData)
    {
        $apiEndpoints = $this->baseUrl . "/subscribers/{$selectedList}.json";

        return HttpHelper::post($apiEndpoints, $this->setSubscriberData($finalData), $this->_defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->campaignMonitorField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? Common::replaceFieldWithValue($value->customValue, $data) : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($selectedList, $fieldValues, $fieldMap, $actions)
    {
        $finalData = (object) $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $existSubscriber = $this->existSubscriber($selectedList, $finalData->EmailAddress);

        if (!isset($existSubscriber->EmailAddress)) {
            $apiResponse = $this->addSubscriber($selectedList, $finalData);

            if (filter_var($apiResponse, FILTER_VALIDATE_EMAIL)) {
                $res = ['message' => __('Subscriber added successfully', 'bit-integrations')];
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Subscriber', 'type_name' => 'Subscriber added']), 'success', wp_json_encode($res));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Subscriber', 'type_name' => 'Adding Subscriber']), 'error', wp_json_encode($apiResponse));
            }
        } else {
            if ($actions->update) {
                $apiResponse = $this->updateSubscriber($existSubscriber->EmailAddress, $finalData, $selectedList);

                if (empty($apiResponse)) {
                    $res = ['message' => 'Subscriber updated successfully'];
                    LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Subscriber', 'type_name' => 'Subscriber updated']), 'success', wp_json_encode($res));
                } else {
                    LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'Subscriber', 'type_name' => 'updating Subscriber']), 'error', wp_json_encode($apiResponse));
                }
            } else {
                LogHandler::save($this->_integrationID, ['type' => 'Subscriber', 'type_name' => 'Adding Subscriber'], 'error', __('Email address already exists in the system', 'bit-integrations'));
            }
        }

        return $apiResponse;
    }

    private function setSubscriberData($finalData)
    {
        $customParams = [];
        $requestPerams = ['ConsentToTrack' => 'Yes'];

        foreach ($finalData as $key => $value) {
            if (stripos($key, '[') > -1) {
                $customParams[]
                = (object) [
                    'Key'   => $key,
                    'Value' => $value
                ]
                ;
            } else {
                $requestPerams[$key] = $value;
            }
        }

        $requestPerams['CustomFields'] = $customParams;

        return wp_json_encode($requestPerams);
    }

    private function existSubscriber($selectedList, $email)
    {
        $apiEndpoints = $this->baseUrl . "/subscribers/{$selectedList}.json?email={$email}&includetrackingpreference=true";

        return HttpHelper::get($apiEndpoints, null, $this->_defaultHeader);
    }
}
