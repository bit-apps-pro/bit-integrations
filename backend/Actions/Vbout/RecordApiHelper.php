<?php

/**
 * Vbout    Record Api
 */

namespace BitApps\Integrations\Actions\Vbout;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $baseUrl = 'https://api.vbout.com/1/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function getContactByEmail($auth_token, $email, $listId)
    {
        $apiEndpoints = $this->baseUrl . 'emailmarketing/getcontactbyemail?key=' . $auth_token . '&email=' . $email . '&list_id=' . $listId;

        return HttpHelper::post($apiEndpoints, null);
    }

    public function editContact($auth_token)
    {
        return $this->baseUrl . 'emailmarketing/editcontact?key=' . $auth_token;
    }

    public function addContact($auth_token, $listId, $contactStatus, $finalData, $emailId)
    {
        $apiEndpoints = $this->baseUrl . 'emailmarketing/addcontact?key=' . $auth_token;

        $requestParams = [
            'email'  => $finalData[$emailId],
            'status' => $contactStatus,
            'listid' => $listId,
        ];

        if (empty($finalData[$emailId])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        foreach ($finalData as $key => $value) {
            if ($key != $emailId) {
                $requestParams['fields'][$key] = $value;
            }
        }
        $requestParams['fields'] = (object) $requestParams['fields'];
        $exitContact = $this->getContactByEmail($auth_token, $finalData[$emailId], $listId);
        $response = [];
        if (isset($exitContact->response->data->contact->errorCode)) {
            $response = HttpHelper::post($apiEndpoints, $requestParams);
        } elseif (!isset($exitContact->response->data->contact->errorCode) && !empty($this->_integrationDetails->actions->update)) {
            $requestParams['id'] = $exitContact->response->data->contact[0]->id;
            $response = HttpHelper::post($this->editContact($auth_token), $requestParams);
            $response->update = true;
        } else {
            return ['success' => false, 'message' => __('Your contact already exists in list!', 'bit-integrations'), 'code' => 400];
        }

        return $response;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->VboutFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute(
        $listId,
        $contactStatus,
        $fieldValues,
        $fieldMap,
        $auth_token
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $emailId = $fieldMap[0]->VboutFormField;

        $apiResponse = $this->addContact($auth_token, $listId, $contactStatus, $finalData, $emailId);
        if ($apiResponse->response->data->id) {
            $res = ['success' => true, 'message' => $apiResponse->update ? __('Your contact has been updated successfully', 'bit-integrations') : __('Your contact has been created successfully', 'bit-integrations'), 'code' => 200];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'success', wp_json_encode($res));
        } elseif ($apiResponse->update) {
            $res = ['success' => true, 'message' => __('Your contact has been updated successfully', 'bit-integrations'), 'code' => 200];
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'contact', 'type_name' => 'add-contact']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
