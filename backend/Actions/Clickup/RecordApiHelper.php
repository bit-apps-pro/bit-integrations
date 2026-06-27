<?php

/**
 * Clickup Record Api
 */

namespace BitApps\Integrations\Actions\Clickup;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;
use CURLFile;

/**
 * Provide functionality for Record insert, upsert
 */
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
        $this->apiUrl = 'https://api.clickup.com/api/v2/';
        $this->defaultHeader = [
            'Authorization' => $integrationDetails->api_key,
            'content-type'  => 'application/json'
        ];
    }

    public function addTask($finalData, $fieldValues)
    {
        if (!isset($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field task name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'description', 'start_date', 'due_date'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if ($key === 'start_date' || $key === 'due_date') {
                    $requestParams[$key] = strtotime($value) * 1000;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'id'    => $key,
                    'value' => $value,
                ];
            }
        }

        $this->type = 'Task';
        $this->typeName = 'Task created';
        $listId = $this->integrationDetails->selectedList;
        $apiEndpoint = $this->apiUrl . "list/{$listId}/task";
        $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);

        return empty($this->integrationDetails->attachment) ? $response : $this->uploadFile($fieldValues[$this->integrationDetails->attachment], $response->id);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->clickupFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'customFieldKey') {
                    $dataFinal[$value->customFieldKey] = self::formatPhoneNumber(Common::replaceFieldWithValue($value->customValue, $data));
                } else {
                    $dataFinal[$actionValue] = self::formatPhoneNumber(Common::replaceFieldWithValue($value->customValue, $data));
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'customFieldKey') {
                    $dataFinal[$value->customFieldKey] = self::formatPhoneNumber($data[$triggerValue]);
                } else {
                    $dataFinal[$actionValue] = self::formatPhoneNumber($data[$triggerValue]);
                }
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'task') {
            $apiResponse = $this->addTask($finalData, $fieldValues);
            $apiResponse = \is_string($apiResponse) ? json_decode($apiResponse) : $apiResponse;
        }

        if (!empty($apiResponse->id)) {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function uploadFile($files, $taskId)
    {
        $result = null;
        foreach ($files as $file) {
            if (\is_array($file)) {
                $result = static::uploadFile($file, $taskId);
            } else {
                $safePath = Common::safeUploadFilePath($file);
                if ($safePath === '') {
                    continue;
                }
                $result = HttpHelper::post(
                    $this->apiUrl . "task/{$taskId}/attachment",
                    ['attachment' => new CURLFile($safePath)],
                    [
                        'Authorization' => $this->integrationDetails->api_key,
                        'Content-Type'  => 'multipart/form-data',
                    ]
                );
            }
        }

        return $result;
    }

    private static function formatPhoneNumber($field)
    {
        if (\is_array($field) || \is_object($field) || !preg_match('/^\+?[0-9\s\-\(\)]+$/', $field)) {
            return $field;
        }

        $leadingPlus = $field[0] === '+' ? '+' : '';
        $cleanedNumber = preg_replace('/[^\d]/', '', $field);

        return $leadingPlus . trim($cleanedNumber);
    }
}
