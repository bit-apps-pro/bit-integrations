<?php

/**
 * Zendesk Record Api
 */

namespace BitApps\Integrations\Actions\Zendesk;

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

    public function __construct($integrationDetails, $integId)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://api.getbase.com/v2/';
        $this->defaultHeader = [
            'Authorization' => 'Bearer ' . $integrationDetails->api_key,
            'Content-Type'  => 'application/json'
        ];
    }

    public function addOrganization($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'phone', 'mobile', 'email', 'description', 'line1', 'city', 'state',  'postal_code', 'country', 'fax', 'facebook', 'skype', 'linkedin', 'twitter'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'line1' || $key == 'city' || $key == 'state' || $key == 'postal_code' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        if ($this->integrationDetails->actions->parentOrganization) {
            $requestParams['parent_organization_id'] = (int) $this->integrationDetails->selectedParentOrganization;
        }

        $requestParams['is_organization'] = true;

        $this->type = 'Organization';
        $this->typeName = 'Organization created';

        $apiEndpoint = $this->apiUrl . 'contacts';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $requestParams]), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['last_name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['first_name', 'last_name', 'title', 'phone', 'mobile', 'email', 'description', 'line1', 'city', 'state', 'postal_code',  'country', 'fax', 'facebook', 'skype', 'linkedin', 'twitter'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'line1' || $key == 'city' || $key == 'state' || $key == 'postal_code' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        $apiEndpoint = $this->apiUrl . 'contacts';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $requestParams]), $this->defaultHeader);
    }

    public function addLead($finalData)
    {
        if (!isset($finalData['last_name'])) {
            return ['success' => false, 'message' => __('Required field lead name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['first_name', 'last_name', 'value', 'title', 'phone', 'mobile', 'fax', 'website', 'email', 'description', 'line1', 'city', 'state', 'postal_code', 'country', 'facebook', 'skype', 'linkedin', 'twitter'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'line1' || $key == 'city' || $key == 'state' || $key == 'postal_code' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        if (!empty($this->integrationDetails->selectedCRMCompany)) {
            $requestParams['organization_name'] = ($this->integrationDetails->selectedCRMCompany);
        }
        if (!empty($this->integrationDetails->selectedCRMSources)) {
            $requestParams['source_id'] = (int) ($this->integrationDetails->selectedCRMSources);
        }

        $this->type = 'Lead';
        $this->typeName = 'Lead created';

        $apiEndpoint = $this->apiUrl . 'leads';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $requestParams]), $this->defaultHeader);
    }

    public function addDeal($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field deal name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'value', 'estimated_close_date', 'added_at', 'last_stage_change_at'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        if (!empty($this->integrationDetails->selectedCRMCompany)) {
            $requestParams['contact_id'] = (int) ($this->integrationDetails->selectedCRMCompany);
        }
        if (!empty($this->integrationDetails->selectedCRMSources)) {
            $requestParams['source_id'] = (int) ($this->integrationDetails->selectedCRMSources);
        }
        if ($this->integrationDetails->actions->stage) {
            $requestParams['stage_id'] = (int) ($this->integrationDetails->selectedStage);
        }

        $this->type = 'Deal';
        $this->typeName = 'Deal created';

        $apiEndpoint = $this->apiUrl . 'deals ';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode(['data' => $requestParams]), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->zendeskFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'fields') {
                    $dataFinal[$value->customFieldKey] = $value->customValue;
                } else {
                    $dataFinal[$actionValue] = $value->customValue;
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'fields') {
                    $dataFinal[$value->customFieldKey] = $data[$triggerValue];
                } else {
                    $dataFinal[$actionValue] = $data[$triggerValue];
                }
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'organization') {
            $apiResponse = $this->addOrganization($finalData);
        } elseif ($actionName === 'contact') {
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'lead') {
            $apiResponse = $this->addLead($finalData);
        } elseif ($actionName === 'deal') {
            $apiResponse = $this->addDeal($finalData);
        }

        if ($apiResponse->data->id || $apiResponse->status === 'success') {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
