<?php

/**
 * CopperCRM Record Api
 */

namespace BitApps\Integrations\Actions\CopperCRM;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, upsert
 */
class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $apiEmail;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiEmail = 'https://api.copper.com/developer_api/v1';
        $this->defaultHeader = [
            'X-PW-AccessToken' => $integrationDetails->api_key,
            'X-PW-Application' => 'developer_api',
            'X-PW-UserEmail'   => $integrationDetails->api_email,
            'Content-Type'     => 'application/json'
        ];
    }

    public function addCompany($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'email_domain', 'details', 'street', 'city', 'state', 'postal_code', 'country',  'phone_numbers', 'websites'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'street' || $key == 'city' || $key == 'state' || $key == 'postal_code' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } elseif (($key == 'websites')) {
                    $requestParams['websites'][] = (object) [
                        'url'      => $value,
                        'category' => 'work'
                    ];
                } elseif ($key == 'phone_numbers') {
                    $requestParams[$key][] = (object) [
                        'number' => $value,
                    ];
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'value'                      => $value,
                    'custom_field_definition_id' => $this->getCustomFieldId($key, 'company')
                ];
            }
        }

        if ($this->integrationDetails->actions->owner) {
            $requestParams['assignee_id'] = (int) ($this->integrationDetails->selectedOwner);
        }

        $this->type = 'Company';
        $this->typeName = 'Company created';

        $apiEndpoint = $this->apiEmail . '/companies';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addPerson($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'title', 'details', 'email', 'email_domain', 'phone_numbers', 'street', 'city', 'state', 'postal_code', 'country', 'websites'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'street' || $key == 'city' || $key == 'state' || $key == 'postal_code' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } elseif (($key == 'websites')) {
                    $requestParams['websites'][] = (object) [
                        'url'      => $value,
                        'category' => 'work'
                    ];
                } elseif ($key === 'email' || $key === 'email_domain') {
                    $requestParams['emails'][] = (object) [
                        'email'    => $value,
                        'category' => 'work'
                    ];
                } elseif ($key == 'phone_numbers') {
                    $requestParams[$key][] = (object) [
                        'number' => $value,
                    ];
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'value'                      => $value,
                    'custom_field_definition_id' => $this->getCustomFieldId($key, 'person')
                ];
            }
        }

        if (isset($this->integrationDetails->selectedOwner)) {
            $requestParams['assignee_id'] = (int) ($this->integrationDetails->selectedOwner);
        }
        if (isset($this->integrationDetails->selectedCompany)) {
            $requestParams['company_id'] = (int) ($this->integrationDetails->selectedCompany);
        }
        if (isset($this->integrationDetails->selectedTags)) {
            $requestParams['tags'] = explode(',', $this->integrationDetails->selectedTags);
        }

        $this->type = 'Person';
        $this->typeName = 'Person created';

        $apiEndpoint = $this->apiEmail . '/people';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addOpportunity($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field opportunity name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'close_date', 'details', 'monetary_value'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if ($key == 'close_date') {
                    $requestParams['close_date'] = gmdate('m/d/Y', strtotime($value));
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'value'                      => $value,
                    'custom_field_definition_id' => $this->getCustomFieldId($key, 'opportunity')
                ];
            }
        }

        if (isset($this->integrationDetails->selectedCRMPeople)) {
            $requestParams['primary_contact_id'] = (int) ($this->integrationDetails->selectedCRMPeople);
        }
        if (isset($this->integrationDetails->selectedCRMPipelines)) {
            $requestParams['pipeline_id'] = (int) ($this->integrationDetails->selectedCRMPipelines);
        }
        if ($this->integrationDetails->actions->owner) {
            $requestParams['assignee_id'] = (int) ($this->integrationDetails->selectedOwner);
        }
        if ($this->integrationDetails->actions->company) {
            $requestParams['company_id'] = (int) ($this->integrationDetails->selectedCompany);
        }
        if (isset($this->integrationDetails->actions->pipelineStage)) {
            $requestParams['pipeline_stage_id'] = (int) ($this->integrationDetails->selectedPipelineStage);
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';

        $apiEndpoint = $this->apiEmail . '/opportunities';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addTask($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field task name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'due_date', 'reminder_date', 'details'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if ($key == 'due_date' || $key == 'reminder_date') {
                    $requestParams[$key] = strtotime($value);
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'value'                      => $value,
                    'custom_field_definition_id' => $this->getCustomFieldId($key, 'task')
                ];
            }
        }

        if ($this->integrationDetails->actions->owner) {
            $requestParams['assignee_id'] = (int) ($this->integrationDetails->selectedOwner);
        }

        $this->type = 'Task';
        $this->typeName = 'Task created';

        $apiEndpoint = $this->apiEmail . '/tasks';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField === 'custom' && isset($value->customValue)
                ? Common::replaceFieldWithValue($value->customValue, $data)
                : $data[$value->formField] ?? null;

            $actionValue = $value->coppercrmFormField === 'customFieldKey' && isset($value->customFieldKey)
                ? Common::replaceFieldWithValue($value->customFieldKey, $data)
                : $value->coppercrmFormField;

            $dataFinal[$actionValue] = $triggerValue;
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'company') {
            $apiResponse = $this->addCompany($finalData);
        } elseif ($actionName === 'person') {
            $apiResponse = $this->addPerson($finalData);
        } elseif ($actionName === 'opportunity') {
            $apiResponse = $this->addOpportunity($finalData);
        } elseif ($actionName === 'task') {
            $apiResponse = $this->addTask($finalData);
        }

        if ($apiResponse->id || $apiResponse->status === 'success') {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function getCustomFieldId($key, $module)
    {
        $apiEndpoint = $this->apiEmail . '/custom_field_definitions';

        $customFields = HttpHelper::get($apiEndpoint, null, $this->defaultHeader);

        foreach ($customFields as $field) {
            if ($field->name === $key && \in_array($module, $field->available_on)) {
                return $field->id;
            }
        }

        $body = [
            'name'         => $key,
            'data_type'    => 'String',
            'available_on' => [$module]
        ];

        $fieldDefinition = HttpHelper::post($apiEndpoint, wp_json_encode($body), $this->defaultHeader);

        $status = $fieldDefinition->id ? 'success' : 'error';
        $message = $fieldDefinition->id ? 'Custom field created successfully' : 'Custom field creation failed';

        LogHandler::save(
            $this->integrationId,
            wp_json_encode(
                [
                    'type'      => 'Create Custom Field',
                    'type_name' => $message
                ]
            ),
            $status,
            wp_json_encode($fieldDefinition)
        );

        return $fieldDefinition->id ?? $key;
    }
}
