<?php

/**
 * Demio Record Api
 */

namespace BitApps\Integrations\Actions\Demio;

use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $apiUrl;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId, $apiSecret, $apiKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://my.demio.com/api/v1';
        $this->defaultHeader = [
            'Api-Key'      => $apiKey,
            'Api-Secret'   => $apiSecret,
            'Content-Type' => 'application/json'
        ];
    }

    public function registration($finalData)
    {
        $this->type = 'Register People to Wabinar';
        $this->typeName = 'Register People to Wabinar';

        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field First Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }
        if (!isset($this->integrationDetails->selectedEvent) || empty($this->integrationDetails->selectedEvent)) {
            return ['success' => false, 'message' => __('Required field Event is empty', 'bit-integrations'), 'code' => 400];
        }
        if (isset($this->integrationDetails->selectedEvent) || !empty($this->integrationDetails->selectedEvent)) {
            $finalData['id'] = $this->integrationDetails->selectedEvent;
        }
        if (isset($this->integrationDetails->selectedSession) && !empty($this->integrationDetails->selectedSession)) {
            $finalData['date_id'] = $this->integrationDetails->selectedSession;
        }

        $apiEndpoint = $this->apiUrl . '/event/register';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->demioFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->registration($finalData);

        if (!isset($apiResponse->errors)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
