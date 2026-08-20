<?php

/**
 * Nimble Record Api
 */

namespace BitApps\Integrations\Actions\Nimble;

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
        $this->apiUrl = 'https://app.nimble.com/api/v1';
        $this->defaultHeader = [
            'Authorization' => "Bearer {$apiKey}",
            'Accept'        => 'application/json',
            'Content-Type'  => 'application/json'
        ];
    }

    public function addContact($finalData, $actionName)
    {
        $fieldData = [];
        $modifierField = ['Email', 'Phone', 'Address', 'URL'];
        $this->type = $actionName === 'person' ? 'People' : 'Company';
        $this->typeName = $actionName === 'person' ? 'People' : 'Company' . ' Added';

        if ($actionName === 'person' && empty($finalData['first name'])) {
            return ['success' => false, 'message' => __('Required field First Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if ($actionName === 'company' && empty($finalData['company name'])) {
            return ['success' => false, 'message' => __('Required field Company Name is empty', 'bit-integrations'), 'code' => 400];
        }

        foreach ($finalData as $key => $value) {
            $fieldData[$key] = $this->setFieldObj($key, $value, $modifierField);
        }
        if ($actionName === 'company' && isset($this->integrationDetails->selectedxofEmployees) && !empty($this->integrationDetails->selectedxofEmployees)) {
            $fieldData['# of employees'] = $this->setFieldObj('# of employees', $this->integrationDetails->selectedxofEmployees, $modifierField);
        }

        $fieldData = array_merge($fieldData, $this->setActionsField($modifierField));
        $dataFinal = [
            'record_type' => $actionName === 'person' ? 'person' : 'company',
            'fields'      => (object) $fieldData
        ];

        $apiEndpoint = $this->apiUrl . '/contact';

        return HttpHelper::post($apiEndpoint, wp_json_encode($dataFinal), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->nimbleFormField;
            $dataFinal[$actionValue] = $triggerValue === 'custom' ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $apiResponse = $this->addContact($finalData, $actionName);

        if (isset($apiResponse->id)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function setFieldObj($key, $value, $modifierField)
    {
        return [
            (object) [
                'value'    => $value,
                'modifier' => \in_array($key, $modifierField) ? 'work' : ''
            ]
        ];
    }

    private function setActionsField()
    {
        $actionFields = [];
        if (isset($this->integrationDetails->selectedRating) && !empty($this->integrationDetails->selectedRating)) {
            $actionFields['rating'] = $this->setFieldObj('rating', $this->integrationDetails->selectedRating, []);
        }
        if (isset($this->integrationDetails->selectedLeadStatus) && !empty($this->integrationDetails->selectedLeadStatus)) {
            $actionFields['lead status'] = $this->setFieldObj('lead status', $this->integrationDetails->selectedLeadStatus, []);
        }
        if (isset($this->integrationDetails->selectedLeadSource) && !empty($this->integrationDetails->selectedLeadSource)) {
            $actionFields['lead source'] = $this->setFieldObj('lead source', $this->integrationDetails->selectedLeadSource, []);
        }
        if (isset($this->integrationDetails->selectedLeadType) && !empty($this->integrationDetails->selectedLeadType)) {
            $actionFields['lead type'] = $this->setFieldObj('lead type', $this->integrationDetails->selectedLeadType, []);
        }

        return $actionFields;
    }
}
