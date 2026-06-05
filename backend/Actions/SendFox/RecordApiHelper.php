<?php

/**
 * SendFox Record Api
 */

namespace BitApps\Integrations\Actions\SendFox;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function addContact($access_token, $listId, $finalData)
    {
        $apiEndpoints = 'https://api.sendfox.com/contacts';
        $listId = explode(',', $listId);
        $header = [
            'Authorization' => "Bearer {$access_token}",
            'Accept'        => 'application/json',
        ];

        $data = [
            'email'      => $finalData['email'],
            'first_name' => $finalData['first_name'],
            'last_name'  => $finalData['last_name'],
            'lists'      => $listId,
        ];

        return HttpHelper::post($apiEndpoints, $data, $header);
    }

    public function createContactList($access_token, $finalData)
    {
        $apiEndpoints = 'https://api.sendfox.com/lists';

        $header = [
            'Authorization' => "Bearer {$access_token}",
            'Accept'        => 'application/json',
        ];

        $data = [
            'name' => $finalData['name'],
        ];

        return HttpHelper::post($apiEndpoints, $data, $header);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sendFoxFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function generateListReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sendFoxListFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function generateReqUnsubscribeDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->sendFoxUnsubscribeFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function unsubscribeContact($access_token, $finalData)
    {
        $apiEndpoints = 'https://api.sendfox.com/unsubscribe';

        $header = [
            'Authorization' => "Bearer {$access_token}",
            'Accept'        => 'application/json',
        ];

        $data = [
            'email' => $finalData['email'],
        ];

        return HttpHelper::request($apiEndpoints, 'PATCH', $data, $header);
    }

    public function execute(
        $listId,
        $fieldValues,
        $fieldMap,
        $access_token,
        $integrationDetails
    ) {
        if ($integrationDetails->mainAction === '1') {
            $finalData = $this->generateListReqDataFromFieldMap($fieldValues, $integrationDetails->field_map_list);
            $apiResponse = $this->createContactList($access_token, $finalData);
            $type = 'List';
            $event_name = 'Create List';
        }
        if ($integrationDetails->mainAction === '2') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = $this->addContact($access_token, $listId, $finalData);
            $type = 'Contact';
            $event_name = 'Create Contact';
        }

        if ($integrationDetails->mainAction === '3') {
            $finalData = $this->generateReqUnsubscribeDataFromFieldMap($fieldValues, $integrationDetails->field_map_unsubscribe);
            $apiResponse = $this->unsubscribeContact($access_token, $finalData);
            $type = 'Contact';
            $event_name = 'Unsubscribe Contact';
        }

        $response_type = HttpHelper::$responseCode >= 200 && HttpHelper::$responseCode < 300 ? 'success' : 'error';
        LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $event_name]), $response_type, wp_json_encode($apiResponse));

        return $apiResponse;
    }
}
