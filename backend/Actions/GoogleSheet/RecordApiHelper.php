<?php

namespace BitApps\Integrations\Actions\GoogleSheet;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const ACTION_FIELDS = [
        'createSpreadsheet' => ['title', 'sheetTitle'],
        'createSheet'       => ['title'],
        'copySheet'         => ['destinationSpreadsheetId'],
        'updateRow'         => ['rowId'],
        'deleteRow'         => ['rowId'],
        'createColumn'      => ['columnName', 'columnIndex'],
    ];

    private const ROW_VALUE_ACTIONS = ['appendOrUpdateRow', 'updateRow'];

    private $_defaultHeader;

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->_defaultHeader['Authorization'] = 'Bearer ' . ($integrationDetails->tokenDetails->access_token ?? '');
        $this->_defaultHeader['Content-Type'] = 'application/json';
    }

    public function insertRecord($spreadsheetsId, $worksheetName, $header, $headerRow, $data)
    {
        $insertRecordEndpoint = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetsId}/values/{$worksheetName}!{$headerRow}:append?valueInputOption=USER_ENTERED";

        return HttpHelper::post($insertRecordEndpoint, $data, $this->_defaultHeader);
    }

    public function updateRecord($spreadsheetId, $worksheetInfo, $data)
    {
        $updateRecordEndpoing = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheetId}/values/{$worksheetInfo}?valueInputOption=USER_ENTERED";

        return HttpHelper::request($updateRecordEndpoing, 'put', $data, $this->_defaultHeader);
    }

    public function formatArrayObject($values)
    {
        $isMatched = false;
        $tmpFields = $values;
        foreach ($tmpFields as $key => $value) {
            if (\is_array($value) || \is_object($value)) {
                $isMatched = true;

                break;
            }
        }
        if ($isMatched) {
            return wp_json_encode($values, JSON_UNESCAPED_UNICODE);
        }

        return implode(',', $values);
    }

    public function execute($fieldValues, $mainAction = 'insertRow')
    {
        $mappedValues = $this->resolveFieldMap($fieldValues);

        if ($mainAction === 'insertRow') {
            return $this->appendRow($mappedValues);
        }

        return $this->dispatchProAction($mainAction, $mappedValues);
    }

    private function appendRow($mappedValues)
    {
        $integrationDetails = $this->_integrationDetails;
        $worksheetName = $integrationDetails->worksheetName;
        $headerRow = $integrationDetails->headerRow;
        $header = $integrationDetails->header;

        $values = [];
        foreach ($this->worksheetHeaders() as $googleSheetHeader) {
            $values[] = empty($mappedValues[$googleSheetHeader]) ? '' : $mappedValues[$googleSheetHeader];
        }

        $data = [];
        $data['range'] = "{$worksheetName}!{$headerRow}";
        $data['majorDimension'] = "{$header}";
        $data['values'][] = $values;

        $recordApiResponse = $this->insertRecord(
            $integrationDetails->spreadsheetId,
            $worksheetName,
            $header,
            $headerRow,
            wp_json_encode($data)
        );

        $responseType = isset($recordApiResponse->error) ? 'error' : 'success';
        LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => 'insert'], $responseType, $recordApiResponse);

        return $recordApiResponse;
    }

    private function dispatchProAction($mainAction, $mappedValues)
    {
        $integrationDetails = $this->_integrationDetails;
        $fieldData = $this->proFieldData($mainAction, $mappedValues);
        $utilities = $integrationDetails->utilities ?? [];
        $default = ['success' => false, 'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')];

        switch ($mainAction) {
            case 'createSpreadsheet':
                $response = Hooks::apply(Config::withPrefix('google_sheet_create_spreadsheet'), $default, $fieldData, $integrationDetails);

                break;

            case 'deleteSpreadsheet':
                $response = Hooks::apply(Config::withPrefix('google_sheet_delete_spreadsheet'), $default, $integrationDetails);

                break;

            case 'createSheet':
                $response = Hooks::apply(Config::withPrefix('google_sheet_create_sheet'), $default, $fieldData, $integrationDetails);

                break;

            case 'copySheet':
                $response = Hooks::apply(Config::withPrefix('google_sheet_copy_sheet'), $default, $fieldData, $integrationDetails);

                break;

            case 'deleteSheet':
                $response = Hooks::apply(Config::withPrefix('google_sheet_delete_sheet'), $default, $integrationDetails);

                break;

            case 'clearSheet':
                $response = Hooks::apply(Config::withPrefix('google_sheet_clear_sheet'), $default, $utilities, $integrationDetails);

                break;

            case 'appendOrUpdateRow':
                $response = Hooks::apply(Config::withPrefix('google_sheet_append_or_update_row'), $default, $fieldData, $integrationDetails);

                break;

            case 'updateRow':
                $response = Hooks::apply(Config::withPrefix('google_sheet_update_row'), $default, $fieldData, $integrationDetails);

                break;

            case 'deleteRow':
                $response = Hooks::apply(Config::withPrefix('google_sheet_delete_row'), $default, $fieldData, $integrationDetails);

                break;

            case 'createColumn':
                $response = Hooks::apply(Config::withPrefix('google_sheet_create_column'), $default, $fieldData, $integrationDetails);

                break;

            default:
                $response = $default;

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function proFieldData($mainAction, $mappedValues)
    {
        $fieldData = [];

        foreach (self::ACTION_FIELDS[$mainAction] ?? [] as $key) {
            $fieldData[$key] = $mappedValues[$key] ?? '';
        }

        if (\in_array($mainAction, self::ROW_VALUE_ACTIONS, true)) {
            $allHeaders = $this->worksheetHeaders();
            $fieldData['values'] = $this->columnOffsets($mappedValues, $allHeaders);
            $fieldData['columnToMatch'] = $this->columnToMatchIndex($allHeaders);
        }

        return $fieldData;
    }

    private function resolveFieldMap($fieldValues)
    {
        $mappedValues = [];

        foreach ($this->_integrationDetails->field_map ?? [] as $fieldPair) {
            if (empty($fieldPair->googleSheetField)) {
                continue;
            }

            $formField = $fieldPair->formField ?? '';

            if ($formField === 'custom' && isset($fieldPair->customValue)) {
                $mappedValues[$fieldPair->googleSheetField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);

                continue;
            }

            $value = $fieldValues[$formField] ?? '';
            $mappedValues[$fieldPair->googleSheetField] = \is_array($value) ? $this->formatArrayObject($value) : $value;
        }

        return $mappedValues;
    }

    private function worksheetHeaders()
    {
        $integrationDetails = $this->_integrationDetails;
        $spreadsheetId = $integrationDetails->spreadsheetId ?? '';
        $worksheetName = $integrationDetails->worksheetName ?? '';
        $headerRow = $integrationDetails->headerRow ?? '';

        if (empty($spreadsheetId) || empty($worksheetName) || empty($headerRow)) {
            return [];
        }

        $headers = $integrationDetails->default->headers->{$spreadsheetId}->{$worksheetName}->{$headerRow} ?? [];

        return array_values((array) $headers);
    }

    private function columnOffsets($mappedValues, $allHeaders)
    {
        $columns = [];

        foreach ($allHeaders as $index => $header) {
            if (isset($mappedValues[$header])) {
                $columns[$index] = $mappedValues[$header];
            }
        }

        return $columns;
    }

    private function columnToMatchIndex($allHeaders)
    {
        $columnToMatch = $this->_integrationDetails->columnToMatch ?? '';
        if ($columnToMatch === '') {
            return -1;
        }

        $index = array_search($columnToMatch, $allHeaders, true);

        return $index === false ? -1 : $index;
    }
}
