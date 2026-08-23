<?php

/**
 * Airtable Record Api
 */

namespace BitApps\Integrations\Actions\Airtable;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationID;

    private $integrationDetails;

    private $defaultHeader;

    public function __construct($integrationDetails, $integId)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationID = $integId;
        $this->defaultHeader = [
            'Authorization' => 'Bearer ' . $integrationDetails->auth_token,
            'Content-Type'  => 'application/json'
        ];
    }

    public function createRecord($finalData)
    {
        $baseId = $this->integrationDetails->selectedBase;
        $tableId = $this->integrationDetails->selectedTable;
        $apiEndpoint = "https://api.airtable.com/v0/{$baseId}/{$tableId}";

        $floatTypeFields = ['currency', 'number', 'percent'];
        $intTypefields = ['duration', 'rating'];

        foreach ($finalData as $key => $value) {
            $keyTypes = explode('{btcbi}', $key);
            $fieldId = $keyTypes[0];
            $fieldType = $keyTypes[1];

            if (\in_array($fieldType, $floatTypeFields)) {
                $fields[$fieldId] = (float) $value;
            } elseif (\in_array($fieldType, $intTypefields)) {
                $fields[$fieldId] = (int) $value;
            } elseif ($fieldType === 'barcode') {
                $fields[$fieldId] = (object) ['text' => $value];
            } elseif ($fieldType === 'multipleAttachments') {
                $fields[$fieldId] = static::parseAttachmentFile([$value]);
            } else {
                $fields[$fieldId] = $value;
            }
        }

        $data['records'][] = (object) [
            'fields' => (object) $fields
        ];

        return HttpHelper::post($apiEndpoint, wp_json_encode($data), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->airtableFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->createRecord($finalData);

        if (isset($apiResponse->records)) {
            $successMessage = ['message' => __('Record created successfully', 'bit-integrations')];
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'Record created']), 'success', wp_json_encode($successMessage));

            if (isset($apiResponse->details) && $apiResponse->details->message == 'partialSuccess') {
                LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'Creating record']), 'error', wp_json_encode($apiResponse->details));
            }
        } else {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'Creating record']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private static function parseAttachmentFile(array $files)
    {
        $allFiles = [];

        foreach ($files as $file) {
            if (\is_array($file)) {
                $allFiles = static::parseAttachmentFile($file);
            } else {
                $allFiles[] = (object) ['url' => Common::fileUrl($file)];
            }
        }

        return $allFiles;
    }
}
