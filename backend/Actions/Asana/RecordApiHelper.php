<?php

/**
 * Asana Record Api
 */

namespace BitApps\Integrations\Actions\Asana;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $apiUrl;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://app.asana.com/api/1.0/';
        $this->defaultHeader = [
            'Authorization' => 'Bearer ' . $integrationDetails->api_key,
            'content-type'  => 'application/json'
        ];
    }

    public function addTask($finalData)
    {
        if (!isset($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field task name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'due_at', 'due_on', 'notes'];
        $customFields = [];
        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $customFields[$key] = $value;
            }
        }

        if (!empty($this->integrationDetails->selectedProject)) {
            $requestParams['projects'][] = ($this->integrationDetails->selectedProject);
        }
        if (\count($customFields)) {
            $requestParams['custom_fields'] = $customFields;
        }

        $this->type = 'Task';
        $this->typeName = 'Task created';

        $apiEndpoint = $this->apiUrl . 'tasks';

        $response = HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $requestParams]), $this->defaultHeader);
        if (!isset($this->integrationDetails->selectedSections) || !isset($response->data)) {
            return $response;
        }

        return $this->addTaskToSection($response->data->gid, $this->integrationDetails->selectedSections);
    }

    public function addTaskToSection($taskId, $sectionId)
    {
        $apiEndpoint = $this->apiUrl . 'sections/' . $sectionId . '/addTask';
        $requestParams['task'] = $taskId;

        return HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $requestParams]), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField ?? null;
            $actionValue = $value->asanaFormField ?? null;

            $fieldKey = $actionValue === 'fields' ? ($value->customFieldKey ?? null) : $actionValue;
            if (empty($fieldKey)) {
                continue;
            }

            $fieldValue = $triggerValue === 'custom' && isset($value->customValue)
                ? Common::replaceFieldWithValue($value->customValue, $data)
                : $data[$triggerValue] ?? null;

            if (\is_null($fieldValue)) {
                continue;
            }

            $dataFinal[$fieldKey] = $fieldValue;
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        if ($actionName !== 'task') {
            // translators: %s: action name
            return new WP_Error(Config::withPrefix('asana_unknown_action'), wp_sprintf(__('Unknown Asana action "%s"', 'bit-integrations'), $actionName));
        }

        $apiResponse = $this->addTask($finalData);

        if (isset($apiResponse->data) || (isset($apiResponse->status) && $apiResponse->status === 'success')) {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
