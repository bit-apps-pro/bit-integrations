<?php

namespace BitApps\Integrations\Actions\KirimEmail;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    public function __construct($integrationId)
    {
        $this->_integrationID = $integrationId;
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];

        foreach ($fieldMap as $key => $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->kirimEmailFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function addSubscriber($api_key, $userName, $listId, $finalData)
    {
        $time = time();
        $generated_token = hash_hmac('sha256', "{$userName}" . '::' . "{$api_key}" . '::' . $time, "{$api_key}");
        $header = [
            'Auth-Id'      => $userName,
            'Auth-Token'   => $generated_token,
            'Timestamp'    => $time,
            'Content-Type' => 'application/x-www-form-urlencoded'
        ];

        $apiEndpoint = 'https://api.kirim.email/v3/subscriber/';

        $data = array_merge($finalData, ['lists' => $listId]);

        return HttpHelper::post($apiEndpoint, wp_json_encode($data), $header);
    }

    public function deleteSubscriber($api_key, $userName, $listId, $finalData)
    {
        $time = time();
        $generated_token = hash_hmac('sha256', "{$userName}" . '::' . "{$api_key}" . '::' . $time, "{$api_key}");
        $header = [
            'Auth-Id'    => $userName,
            'Auth-Token' => $generated_token,
            'Timestamp'  => $time,
        ];

        $apiEndpoint = "https://api.kirim.email/v3/subscriber/email/{$finalData['email']}";
        $apiRes = HttpHelper::get($apiEndpoint, null, $header);

        if (isset($apiRes->status) && $apiRes->status == 'success') {
            $subscriberId = $apiRes->data->id;
            $listIdBySearchMail = $apiRes->data->list[0]->id;
            $time = time();
            $generated_token = hash_hmac('sha256', "{$userName}" . '::' . "{$api_key}" . '::' . $time, "{$api_key}");
            $header = [
                'Auth-Id'    => $userName,
                'Auth-Token' => $generated_token,
                'Timestamp'  => $time,
                'List-Id'    => $listIdBySearchMail,
            ];
            $apiEndpointDelete = "https://api.kirim.email/v3/subscriber/{$subscriberId}";

            return HttpHelper::request($apiEndpointDelete, 'DELETE', null, $header);
        }

        return false;
    }

    public function execute(
        $api_key,
        $userName,
        $fieldValues,
        $fieldMap,
        $integrationDetails,
        $mainAction
    ) {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        if ($mainAction == '1') {
            $listId = $integrationDetails->listId;
            $apiResponse = $this->addSubscriber($api_key, $userName, $listId, $finalData);
            if (isset($apiResponse->code) && $apiResponse->code == 200) {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'insert', 'type_name' => 'add-subscriber']), 'success', wp_json_encode($apiResponse));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'insert', 'type_name' => 'add-subscriber']), 'error', wp_json_encode($apiResponse));
            }
        }
        if ($mainAction == '2') {
            $listId = $integrationDetails->listId;
            $apiResponse = $this->deleteSubscriber($api_key, $userName, $listId, $finalData);
            if (isset($apiResponse->code) && $apiResponse->code == 200) {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'delete', 'type_name' => 'delete-subscriber']), 'success', wp_json_encode($apiResponse->message));
            } else {
                LogHandler::save($this->_integrationID, wp_json_encode(['type' => 'delete', 'type_name' => 'delete-subscriber']), 'error', wp_json_encode(__('Subscriber not found , failed to delete subscriber', 'bit-integrations')));
            }
        }

        return $apiResponse;
    }
}
