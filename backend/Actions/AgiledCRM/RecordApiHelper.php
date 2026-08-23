<?php

/**
 * AgiledCRM Record Api
 */

namespace BitApps\Integrations\Actions\AgiledCRM;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $integrationDetails;

    private $integrationId;

    private $authToken;

    private $defaultHeader;

    private $type;

    private $typeName;

    public function __construct($integrationDetails, $integId)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->authToken = $integrationDetails->auth_token;
        $this->defaultHeader = [
            'Brand'        => $integrationDetails->brand,
            'Content-Type' => 'application/json'
        ];
    }

    public function addAccount($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = "https://my.agiled.app/api/v1/accounts?api_token={$this->authToken}";

        $staticFieldsKeys = ['name', 'description', 'size', 'email', 'phone', 'website', 'facebook', 'linkedin', 'twitter', 'skype', 'note', 'tax_no'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'key'   => $key,
                    'value' => $value
                ];
            }
        }

        if ($this->integrationDetails->actions->owner) {
            $requestParams['owner_id'] = $this->integrationDetails->selectedOwner;
        }

        $this->type = 'Account';
        $this->typeName = 'Account created';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['first_name']) || empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Name or Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = "https://my.agiled.app/api/v1/contacts?api_token={$this->authToken}";

        $staticFieldsKeys = ['first_name', 'email', 'last_name', 'phone', 'job_title', 'facebook', 'linkedin', 'twitter', 'skype', 'note', 'tax_no', 'last_contacted'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['custom_fields'][] = (object) [
                    'key'   => $key,
                    'value' => $value
                ];
            }
        }

        if (isset($this->integrationDetails->contactRole)) {
            $requestParams['role'] = $this->integrationDetails->contactRole;
        }

        if ($this->integrationDetails->actions->account) {
            $requestParams['account_id'] = $this->integrationDetails->selectedAccount;
        }

        if ($this->integrationDetails->actions->owner) {
            $requestParams['owner_id'] = (int) $this->integrationDetails->selectedOwner;
        }

        if ($this->integrationDetails->actions->source) {
            $requestParams['source_id'] = (int) $this->integrationDetails->selectedSource;
        }

        if ($this->integrationDetails->actions->status) {
            $requestParams['status_id'] = (int) $this->integrationDetails->selectedStatus;
        }

        if ($this->integrationDetails->actions->lifeCycleStage) {
            $requestParams['life_cycle_stage'] = $this->integrationDetails->selectedLifeCycleStage;
        }

        if ($this->integrationDetails->actions->followUp) {
            $requestParams['next_follow_up'] = $this->integrationDetails->selectedFollowUp;
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addDeal($finalData)
    {
        if (empty($finalData['deal_name'])) {
            return ['success' => false, 'message' => __('Required field deal name is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = "https://my.agiled.app/api/v1/crm/pipeline-deals?api_token={$this->authToken}";

        $requestParams['pipeline_id'] = (int) $this->integrationDetails->selectedCRMPipeline;
        $requestParams['stage_id'] = (int) $this->integrationDetails->selectedCRMPipelineStages;

        foreach ($finalData as $key => $value) {
            $requestParams[$key] = $value;
        }

        if ($this->integrationDetails->actions->owner) {
            $requestParams['deal_owner'] = (int) $this->integrationDetails->selectedOwner;
        }

        if ($this->integrationDetails->actions->dealType) {
            $requestParams['deal_type'] = $this->integrationDetails->selectedDealType;
        }

        $this->type = 'Deal';
        $this->typeName = 'Deal created';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->agiledFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'customFieldKey') {
                    $dataFinal[$value->customFieldKey] = Common::replaceFieldWithValue($value->customValue, $data);
                } else {
                    $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'customFieldKey') {
                    $dataFinal[$value->customFieldKey] = $data[$triggerValue];
                } else {
                    $dataFinal[$actionValue] = $data[$triggerValue];
                }
            }
        }

        return $dataFinal;
    }

    public function generateDealFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->agiledFormField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = $value->customValue;
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = $data[$triggerValue];
            }
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        if ($actionName === 'account') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = $this->addAccount($finalData);
        } elseif ($actionName === 'contact') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'deal') {
            $finalData = $this->generateDealFieldMap($fieldValues, $fieldMap);
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
