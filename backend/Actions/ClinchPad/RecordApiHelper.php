<?php

/**
 * ClinchPad Record Api
 */

namespace BitApps\Integrations\Actions\ClinchPad;

use BitApps\Integrations\Core\Util\Common;
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
        $this->apiUrl = 'https://www.clinchpad.com/api/v1';
        $this->defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("api-key:{$integrationDetails->api_key}"),
            'Content-Type'  => 'application/json'
        ];
    }

    public function addOrganization($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'phone', 'email', 'website', 'address'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['fields'][] = (object) [
                    '_id'   => $key,
                    'value' => $value,
                ];
            }
        }
        $this->type = 'Organization';
        $this->typeName = 'Organization created';

        $apiEndpoint = $this->apiUrl . '/organizations';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'designation', 'phone', 'email', 'address'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['fields'][] = (object) [
                    '_id'   => $key,
                    'value' => $value,
                ];
            }
        }

        if (!empty($this->integrationDetails->actions->parentOrganization)) {
            $requestParams['organization_id'] = ($this->integrationDetails->selectedParentOrganization);
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        $apiEndpoint = $this->apiUrl . '/contacts';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addLead($finalData)
    {
        if (!isset($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field lead name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'size'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['fields'][] = (object) [
                    '_id'   => $key,
                    'value' => $value,
                ];
            }
        }

        if (!empty($this->integrationDetails->selectedCRMPipeline)) {
            $requestParams['pipeline_id'] = ($this->integrationDetails->selectedCRMPipeline);
        }
        if ($this->integrationDetails->actions->contact) {
            $contactId = ($this->integrationDetails->selectedContact);
        }

        $this->type = 'Lead';
        $this->typeName = 'Lead created';

        $apiEndpoint = $this->apiUrl . '/leads';

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
        $this->addContactToLead($response->_id, $contactId);
    }

    public function addContactToLead($leadId, $contactId)
    {
        $apiEndpoint = $this->apiUrl . "/leads/{$leadId}/contacts/{$contactId}";

        return $response = HttpHelper::post($apiEndpoint, $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->clinchPadFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'fields') {
                    $dataFinal[$value->customFieldKey] = Common::replaceFieldWithValue($value->customValue, $data);
                } else {
                    $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
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
        }

        if ($apiResponse->_id) {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
