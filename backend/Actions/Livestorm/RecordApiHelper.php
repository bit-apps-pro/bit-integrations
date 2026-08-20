<?php

/**
 * Livestorm Record Api
 */

namespace BitApps\Integrations\Actions\Livestorm;

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

    public function __construct($integrationDetails, $integId, $apiKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://api.livestorm.co/v1';
        $this->defaultHeader = [
            'Authorization' => $apiKey,
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json'
        ];
    }

    public function registration($finalData)
    {
        $this->type = 'Add People to Event Session';
        $this->typeName = 'Add People to Event Session';

        if (!isset($this->integrationDetails->selectedEvent) || empty($this->integrationDetails->selectedEvent)) {
            // translators: %s: Field name
            // translators: %s: Placeholder value
            return ['success' => false, 'message' => wp_sprintf(__('Required field %s is empty', 'bit-integrations'), __('Event', 'bit-integrations')), 'code' => 400];
        }
        if (!isset($this->integrationDetails->selectedSession) || empty($this->integrationDetails->selectedSession)) {
            // translators: %s: Field name
            // translators: %s: Placeholder value
            return ['success' => false, 'message' => wp_sprintf(__('Required field %s is empty', 'bit-integrations'), __('Session', 'bit-integrations')), 'code' => 400];
        }

        $apiEndpoint = $this->apiUrl . "/sessions/{$this->integrationDetails->selectedSession}/people";

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $fieldData = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->livestormFormField;

            $fieldData[]
            = (object) [
                'id'    => $actionValue,
                'value' => $triggerValue === 'custom' ? $value->customValue : $data[$triggerValue]
            ]
            ;
        }

        return [
            'data' => [
                'type'       => 'people',
                'attributes' => [
                    'fields' => $fieldData
                ]
            ]
        ];
    }

    public function execute($fieldValues, $fieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->registration($finalData);

        if (isset($apiResponse->data)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
