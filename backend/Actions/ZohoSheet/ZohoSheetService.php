<?php

namespace BitApps\Integrations\Actions\ZohoSheet;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class ZohoSheetService
{
    private $integrationID;

    private $dataCenter;

    private $workbook;

    private $worksheet;

    private $headerRow;

    private $defaultHeader;

    public function __construct($integrationDetails, $integId, $access_token)
    {
        $this->integrationID = $integId;
        $this->dataCenter = $integrationDetails->dataCenter;
        $this->workbook = $integrationDetails->selectedWorkbook;
        $this->worksheet = $integrationDetails->selectedWorksheet;
        $this->headerRow = $integrationDetails->headerRow;
        $this->defaultHeader = [
            'Authorization' => "Zoho-oauthtoken {$access_token}",
            'Content-Type'  => 'application/json'
        ];
    }

    public function addRecord($finalData)
    {
        $jsonData = wp_json_encode($finalData);
        $data = "[{$jsonData}]";

        $apiEndpoint = "https://sheet.zoho.{$this->dataCenter}/api/v2/{$this->workbook}?method=worksheet.records.add&worksheet_name={$this->worksheet}&header_row={$this->headerRow}&json_data={$data}";

        return HttpHelper::post($apiEndpoint, null, $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->zohoSheetFormField;
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
        $apiResponse = $this->addRecord($finalData);

        if ($apiResponse->status === 'success') {
            $res = ['message' => 'Record added successfully'];
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'Record added']), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationID, wp_json_encode(['type' => 'record', 'type_name' => 'Adding Record']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
