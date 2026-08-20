<?php

/**
 * Flowlu Record Api
 */

namespace BitApps\Integrations\Actions\Flowlu;

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

    public function __construct($integrationDetails, $integId, $comapnyName)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = "https://{$comapnyName}.flowlu.com/api/v1";
        $this->defaultHeader = ['Content-type' => 'application/x-www-form-urlencoded'];
    }

    public function addAccount($finalData, $apiKey)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedAccountType) || empty($this->integrationDetails->selectedAccountType)) {
            return ['success' => false, 'message' => __('Required field Account type is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['type'] = $this->integrationDetails->selectedAccountType;
        if (isset($this->integrationDetails->selectedCategory) && !empty($this->integrationDetails->selectedCategory)) {
            $finalData['account_category_id'] = ($this->integrationDetails->selectedCategory);
        }
        if (isset($this->integrationDetails->selectedIndustry) && !empty($this->integrationDetails->selectedIndustry)) {
            $finalData['industry_id'] = ($this->integrationDetails->selectedIndustry);
        }

        $this->type = 'Account';
        $this->typeName = 'Account created';
        $apiEndpoint = $this->apiUrl . "/module/crm/account/create?api_key={$apiKey}";

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function addOpportunity($finalData, $apiKey)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field lastName is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedPipeline) || empty($this->integrationDetails->selectedPipeline)) {
            return ['success' => false, 'message' => __('Required field Pipeline is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedOpportunityStage) || empty($this->integrationDetails->selectedOpportunityStage)) {
            return ['success' => false, 'message' => __('Required field Opportunity Stage is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['pipeline_id'] = $this->integrationDetails->selectedPipeline;
        $finalData['pipeline_stage_id'] = $this->integrationDetails->selectedOpportunityStage;

        if (isset($this->integrationDetails->selectedSource) && !empty($this->integrationDetails->selectedSource)) {
            $finalData['source_id'] = ($this->integrationDetails->selectedSource);
        }
        if (isset($this->integrationDetails->selectedCustomer) && !empty($this->integrationDetails->selectedCustomer)) {
            $finalData['customer_id'] = ($this->integrationDetails->selectedCustomer);
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';
        $apiEndpoint = $this->apiUrl . "/module/crm/lead/create?api_key={$apiKey}";

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function addProject($finalData, $apiKey)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field lastName is empty', 'bit-integrations'), 'code' => 400];
        }

        if (isset($this->integrationDetails->selectedManager) && !empty($this->integrationDetails->selectedManager)) {
            $finalData['manager_id'] = ($this->integrationDetails->selectedManager);
        }
        if (isset($this->integrationDetails->selectedProjectStage) && !empty($this->integrationDetails->selectedProjectStage)) {
            $finalData['stage_id'] = ($this->integrationDetails->selectedProjectStage);
        }
        if (isset($this->integrationDetails->selectedPortfolio) && !empty($this->integrationDetails->selectedPortfolio)) {
            $finalData['briefcase_id'] = ($this->integrationDetails->selectedPortfolio);
        }
        if (isset($this->integrationDetails->selectedPriority) && !empty($this->integrationDetails->selectedPriority)) {
            $finalData['priority'] = ($this->integrationDetails->selectedPriority);
        }
        if (isset($this->integrationDetails->selectedProjectOpportunity) && !empty($this->integrationDetails->selectedProjectOpportunity)) {
            $finalData['crm_lead_id'] = ($this->integrationDetails->selectedProjectOpportunity);
        }
        if (isset($this->integrationDetails->selectedCustomer) && !empty($this->integrationDetails->selectedCustomer)) {
            $finalData['customer_id'] = ($this->integrationDetails->selectedCustomer);
        }

        $this->type = 'Project';
        $this->typeName = 'Project created';
        $apiEndpoint = $this->apiUrl . "/module/st/projects/create?api_key={$apiKey}";

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->flowluFormField;

            $dataFinal[$actionValue] = ($triggerValue === 'custom' && !empty($value->customValue))
                ? Common::replaceFieldWithValue($value->customValue, $data)
                : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName, $apiKey)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        switch ($actionName) {
            case 'account':
                $apiResponse = $this->addAccount($finalData, $apiKey);

                break;
            case 'opportunity':
                $apiResponse = $this->addOpportunity($finalData, $apiKey);

                break;
            case 'project':
                $apiResponse = $this->addProject($finalData, $apiKey);

                break;
            default:
                break;
        }

        if (!isset($apiResponse->error)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
