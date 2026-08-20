<?php

/**
 * Moosend Record Api
 */

namespace BitApps\Integrations\Actions\Moosend;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $baseUrl = 'https://api.moosend.com/v3/';

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function generateReqDataFromFieldMap($data, $field_map)
    {
        foreach ($field_map as $key => $value) {
            $triggerValue = $value->formFields;
            $actionValue = $value->moosendFormFields;

            $formattedValue = isset($data[$triggerValue]) ? MoosendHelper::formatPhoneNumber($data[$triggerValue]) : null;

            if (strpos($actionValue, 'custom_field_') !== 0) {
                $dataFinal[$actionValue] = ($triggerValue === 'custom')
                    ? Common::replaceFieldWithValue($value->customValue, $data)
                    : $formattedValue;
            }
        }

        $filtered = Hooks::apply(Config::withPrefix('moosend_map_custom_fields'), $dataFinal, $data, $field_map);

        $filtered = Hooks::apply('btcbi_moosend_map_custom_fields', $filtered, $data, $field_map);

        return $filtered;
    }

    public function response($status, $code, $type, $typeName, $apiResponse)
    {
        $res = ['success' => $code === 200 ? true : false, 'message' => $apiResponse, 'code' => $code];
        LogHandler::save($this->_integrationID, wp_json_encode(['type' => $type, 'type_name' => $typeName]), $status, wp_json_encode($res));

        return $res;
    }

    public function subscribe($authKey, $listId, $formData)
    {
        $apiEndpoints = "{$this->baseUrl}subscribers/{$listId}/subscribe.json?apikey={$authKey}";
        $headers = ['Content-Type' => 'application/json'];

        return HttpHelper::post($apiEndpoints, wp_json_encode($formData), $headers);
    }

    public function unsubscribe($authKey, $formData)
    {
        $apiEndpoints = "{$this->baseUrl}subscribers/unsubscribe.json?apikey={$authKey}";
        $headers = [
            'Content-Type' => 'application/json'
        ];

        return HttpHelper::post($apiEndpoints, wp_json_encode($formData), $headers);
    }

    public function unsubscribeFromList($authKey, $listId, $formData)
    {
        $apiEndpoints = "{$this->baseUrl}subscribers/{$listId}/unsubscribe.json?apikey={$authKey}";
        $headers = [
            'Content-Type' => 'application/json'
        ];

        return HttpHelper::post($apiEndpoints, wp_json_encode($formData), $headers);
    }

    public function execute(
        $listId,
        $method,
        $fieldValues,
        $field_map,
        $authKey
    ) {
        $finalData = (object) $this->generateReqDataFromFieldMap($fieldValues, $field_map);

        switch ($method) {
            case 1:
                $apiResponse = $this->subscribe($authKey, $listId, $finalData);
                if ($apiResponse->Code !== 0) {
                    $this->response('error', 400, 'subscribe', 'Active-contact', $apiResponse);
                } else {
                    $this->response('success', 200, 'subscribe', 'Active-contact', $apiResponse);
                }

                break;
            case 2:
                $apiResponse = $this->unsubscribeFromList($authKey, $listId, $finalData);
                if ($apiResponse->Code === 300) {
                    $this->response('error', 400, 'unsubscribe', 'unsubscribe-from-list', $apiResponse);
                } else {
                    $this->response('success', 200, 'unsubscribe', 'unsubscribe-from-list', $apiResponse);
                }

                break;
            case 0:
                $apiResponse = $this->unsubscribe($authKey, $finalData);
                if ($apiResponse->Code === 300) {
                    $this->response('error', 400, 'unsubscribe', 'unsubscribe-contact', $apiResponse);
                } else {
                    $this->response('success', 200, 'unsubscribe', 'unsubscribe-contact', $apiResponse);
                }

                break;
        }

        return $apiResponse;
    }

    private static function formatPhoneNumber($field)
    {
        if (!preg_match('/^\+?[0-9\s\-\(\)]+$/', $field)) {
            return $field;
        }

        $leadingPlus = $field[0] === '+' ? '+' : '';
        $cleanedNumber = preg_replace('/[^\d]/', '', $field);
        $formattedDigits = trim(chunk_split($cleanedNumber, 3, ' '));

        return $leadingPlus . $formattedDigits;
    }
}
