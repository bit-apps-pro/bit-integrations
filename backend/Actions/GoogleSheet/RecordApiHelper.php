<?php

/**
 * ZohoRecruit Record Api
 */

namespace BitApps\Integrations\Actions\GoogleSheet;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_defaultHeader;

    private $_integrationID;

    public function __construct($tokenDetails, $integId)
    {
        $this->_defaultHeader['Authorization'] = "Bearer {$tokenDetails->access_token}";
        $this->_defaultHeader['Content-Type'] = 'application/json';
        $this->_integrationID = $integId;
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

    public function execute($spreadsheetId, $worksheetName, $headerRow, $header, $actions, $defaultConf, $fieldValues, $fieldMap)
    {
        $fieldData = [];
        $allHeaders = $defaultConf->headers->{$spreadsheetId}->{$worksheetName}->{$headerRow};

        foreach ($fieldMap as $fieldKey => $fieldPair) {
            if (!empty($fieldPair->googleSheetField)) {
                if ($fieldPair->formField === 'custom' && isset($fieldPair->customValue)) {
                    $fieldData[$fieldPair->googleSheetField] = Common::replaceFieldWithValue($fieldPair->customValue, $fieldValues);
                } else {
                    $fieldData[$fieldPair->googleSheetField] = isset($fieldValues[$fieldPair->formField]) && \is_array($fieldValues[$fieldPair->formField]) ? $this->formatArrayObject($fieldValues[$fieldPair->formField]) : $fieldValues[$fieldPair->formField];
                }
            }
        }
        $values = [];

        foreach ($allHeaders as $googleSheetHeader) {
            if (!empty($fieldData[$googleSheetHeader])) {
                $values[] = $fieldData[$googleSheetHeader];
            } else {
                $values[] = '';
            }
        }

        $data = [];
        $data['range'] = "{$worksheetName}!{$headerRow}";
        $data['majorDimension'] = "{$header}";
        $data['values'][] = $values;

        $recordApiResponse = $this->insertRecord($spreadsheetId, $worksheetName, $header, $headerRow, wp_json_encode($data));
        $type = 'insert';
        if (isset($recordApiResponse->error)) {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'error', $recordApiResponse);
        } else {
            LogHandler::save($this->_integrationID, ['type' => 'record', 'type_name' => $type], 'success', $recordApiResponse);
        }

        return $recordApiResponse;
    }
}
