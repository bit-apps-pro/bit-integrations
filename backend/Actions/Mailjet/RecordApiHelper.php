<?php

/**
 * Mailjet Record Api
 */

namespace BitApps\Integrations\Actions\Mailjet;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_responseType;

    public function __construct($integrationDetails, $integId, $apiKey, $secretKey)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$apiKey}:{$secretKey}"),
            'Content-Type'  => 'application/json'
        ];
    }

    public function addSubscriber($selectedLists, $finalData)
    {
        $apiEndpoints = 'https://api.mailjet.com/v3/REST/contact/managemanycontacts';

        if (empty($finalData['Email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $this->_responseType = $this->isExist($finalData['Email']);

        if (!empty($selectedLists)) {
            $aplitSelectedLists = explode(',', $selectedLists);
            foreach ($aplitSelectedLists as $list) {
                $contactsLists[] = (object) [
                    'Action' => 'addforce',
                    'ListID' => $list
                ];
            }
        }

        $contacts['IsExcludedFromCampaigns'] = !empty($this->_integrationDetails->actions->IsExcludedFromCampaigns) ? true : false;

        foreach ($finalData as $key => $value) {
            if ($key == 'Email') {
                $contacts[$key] = $value;
            } else {
                $customFields[$key] = $value;
            }
        }

        if (!empty($customFields)) {
            $contacts['Properties'] = (object) $customFields;
        }

        $requestParams['Contacts'][] = (object) $contacts;
        $requestParams['ContactsLists'] = $contactsLists;

        $response = HttpHelper::post($apiEndpoints, wp_json_encode($requestParams), $this->_defaultHeader);

        return $this->jobMonitoring($response);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->mailjetFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($selectedLists, $fieldValues, $fieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addSubscriber($selectedLists, $finalData);

        if (empty($apiResponse)) {
            $res = ['message' => 'Contact ' . $this->_responseType . ' successfully'];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'Contact ' . $this->_responseType]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => '', 'type_name' => 'Adding contact']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function jobMonitoring($response)
    {
        $jobId = $response->Data[0]->JobID;
        $apiEndpoint = 'https://api.mailjet.com/v3/REST/contact/managemanycontacts/' . $jobId;
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        return $response->Data[0]->Error;
    }

    private function isExist($email)
    {
        $encodedEmail = rawurlencode($email);
        $apiEndpoint = 'https://api.mailjet.com/v3/REST/contact/' . $encodedEmail;
        $response = HttpHelper::get($apiEndpoint, null, $this->_defaultHeader);

        return isset($response->Data) ? 'updated' : 'created';
    }
}
