<?php

namespace BitApps\Integrations\Actions\GoogleSheet;

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class ProRecordApiHelper
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

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $mainAction)
    {
        $integrationDetails = $this->_integrationDetails;
        $integrationDetails->tokenDetails = GoogleSheetController::resolveTokenDetails($integrationDetails, $this->_integrationID);

        $fieldData = $this->generateFieldData($fieldValues, $mainAction);
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

    private function generateFieldData($fieldValues, $mainAction)
    {
        $mappedValues = $this->mapFieldValues($fieldValues);
        $fieldData = [];

        foreach (self::ACTION_FIELDS[$mainAction] ?? [] as $key) {
            $fieldData[$key] = $mappedValues[$key] ?? '';
        }

        if (\in_array($mainAction, self::ROW_VALUE_ACTIONS, true)) {
            $allHeaders = $this->getWorksheetHeaders();
            $fieldData['values'] = $this->mapRowValues($mappedValues, $allHeaders);
            $fieldData['columnToMatch'] = $this->getColumnToMatchIndex($allHeaders);
        }

        return $fieldData;
    }

    /**
     * Resolve every field-map row to its target key. Rows naming one of the action's
     * own fields carry that input; the rest name a worksheet header.
     */
    private function mapFieldValues($fieldValues)
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
            $mappedValues[$fieldPair->googleSheetField] = \is_array($value) || \is_object($value)
                ? wp_json_encode($value, JSON_UNESCAPED_UNICODE)
                : $value;
        }

        return $mappedValues;
    }

    private function getWorksheetHeaders()
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

    /**
     * Map each mapped header to its 0-based offset from the header row's first column;
     * unmapped headers are omitted so an update never blanks a column the user left alone.
     */
    private function mapRowValues($mappedValues, $allHeaders)
    {
        $columns = [];

        foreach ($allHeaders as $index => $header) {
            if (isset($mappedValues[$header])) {
                $columns[$index] = $mappedValues[$header];
            }
        }

        return $columns;
    }

    private function getColumnToMatchIndex($allHeaders)
    {
        $columnToMatch = $this->_integrationDetails->columnToMatch ?? '';
        if ($columnToMatch === '') {
            return -1;
        }

        $index = array_search($columnToMatch, $allHeaders, true);

        return $index === false ? -1 : $index;
    }
}
