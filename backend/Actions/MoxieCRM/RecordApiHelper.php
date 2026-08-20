<?php

/**
 * MoxieCRM Record Api
 */

namespace BitApps\Integrations\Actions\MoxieCRM;

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
        $this->apiUrl = $integrationDetails->api_url;
        $this->defaultHeader = [
            'X-API-KEY'    => $integrationDetails->api_key,
            'Content-Type' => 'application/json'
        ];
    }

    public function addClient($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'address1', 'address2', 'city', 'locality', 'postal', 'country', 'website',  'phone', 'leadSource', 'hourlyAmount', 'currency', 'notes', 'firstName', 'lastName', 'email'];
        $contacts = [];
        foreach ($finalData as $key => $value) {
            if ($key == 'firstName' || $key == 'lastName' || $key == 'email') {
                $contacts[$key] = $value;
            } else {
                $requestParams[$key] = $value;
            }
        }
        $requestParams['contacts'][] = $contacts;

        if ($this->integrationDetails->recordType) {
            $requestParams['clientType'] = $this->integrationDetails->recordType;
        }

        $this->type = 'Client';
        $this->typeName = 'Client created';

        $apiEndpoint = 'https://' . $this->apiUrl . '/api/public/action/clients/create';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['email', 'first', 'last', 'phone', 'notes'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['customValues'][] = (object) [
                    'Custom Field'               => $value,
                    'custom_field_definition_id' => $key
                ];
            }
        }

        if ($this->integrationDetails->actions->client) {
            $requestParams['clientName'] = $this->integrationDetails->selectedClient;
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        $apiEndpoint = 'https://' . $this->apiUrl . '/api/public/action/contacts/create';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addOpportunity($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field opportunity name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'description', 'value', 'firstName', 'lastName', 'email', 'phone', 'role', 'businessName', 'website', 'address1', 'address2', 'city', 'locality', 'postal', 'country', 'sourceUrl', 'leadSource'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'firstName' || $key == 'lastName' || $key == 'email' || $key == 'phone' || $key == 'role' || $key == 'businessName' || $key == 'website' || $key == 'address1' || $key == 'address2' || $key == 'city' || $key == 'locality' || $key == 'postal' || $key == 'country' || $key == 'sourceUrl' || $key == 'leadSource')) {
                    $requestParams['leadInfo'][$key] = $value;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['customValues'][] = (object) [
                    'Custom Field' => $value,
                ];
            }
        }

        if ($this->integrationDetails->actions->client) {
            $requestParams['clientName'] = ($this->integrationDetails->selectedClient);
        }
        if (!empty($this->integrationDetails->actions->pipelineStage)) {
            $requestParams['stageName'] = ($this->integrationDetails->selectedPipelineStage);
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';

        $apiEndpoint = 'https://' . $this->apiUrl . '/api/public/action/opportunities/create';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->moxiecrmFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'customValues') {
                    $dataFinal[$value->customFieldKey] = $value->customValue;
                } else {
                    $dataFinal[$actionValue] = $value->customValue;
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'customValues') {
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
        if ($actionName === 'client') {
            $apiResponse = $this->addClient($finalData);
        } elseif ($actionName === 'contact') {
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'opportunity') {
            $apiResponse = $this->addOpportunity($finalData);
        }

        if (isset($apiResponse->id) || $apiResponse->status === 'success') {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
