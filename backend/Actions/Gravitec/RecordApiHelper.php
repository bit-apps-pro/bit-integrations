<?php

/**
 * Gravitec Record Api
 */

namespace BitApps\Integrations\Actions\Gravitec;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId, $appKey, $appSecret)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->defaultHeader = [
            'Content-Type'  => 'application/json',
            'Authorization' => 'Basic ' . base64_encode("{$appKey}:{$appSecret}")
        ];
    }

    public function pushNotification($finalData)
    {
        $this->type = 'Notification';
        $this->typeName = 'Notification Pushed';

        if (empty($finalData['message'])) {
            return ['success' => false, 'message' => __('Required field Message is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['icon'])) {
            return ['success' => false, 'message' => __('Required field Icon is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['redirect_url'])) {
            return ['success' => false, 'message' => __('Required field Refirect URL is empty', 'bit-integrations'), 'code' => 400];
        }

        $requestData = [];
        $payloadData = [];
        $payload = ['message', 'title', 'icon', 'image', 'redirect_url'];
        foreach ($finalData as $key => $value) {
            if (array_search($key, $payload) === false) {
                $requestData[$key] = $value;
            } else {
                $payloadData[$key] = $value;
            }
        }

        if (!empty($this->integrationDetails->selectedButtonTitle) && !empty($this->integrationDetails->selectedButtonURL)) {
            $payloadData['buttons '] = [(object) [
                'title' => $this->integrationDetails->selectedButtonTitle,
                'url'   => $this->integrationDetails->selectedButtonURL
            ]];
        }

        $requestData['payload'] = (object) $payloadData;
        $apiEndpoint = 'https://uapi.gravitec.net/api/v3/push';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->gravitecFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'notification') {
            $apiResponse = $this->pushNotification($finalData);
        }

        if (!isset($apiResponse->error)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
