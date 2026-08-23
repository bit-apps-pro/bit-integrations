<?php

/**
 * Insightly Record Api
 */

namespace BitApps\Integrations\Actions\Insightly;

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
            'Authorization' => 'Basic ' . base64_encode("{$integrationDetails->api_key}:"),
            'Content-Type'  => 'application/json'
        ];
    }

    public function addOrganisation($finalData)
    {
        if (empty($finalData['ORGANISATION_NAME'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['ORGANISATION_NAME', 'PHONE', 'PHONE_FAX', 'WEBSITE', 'SOCIAL_FACEBOOK', 'SOCIAL_LINKEDIN', 'SOCIAL_TWITTER', 'ADDRESS_BILLING_STREET', 'ADDRESS_BILLING_CITY', 'ADDRESS_BILLING_STATE', 'ADDRESS_BILLING_COUNTRY', 'ADDRESS_BILLING_POSTCODE', 'ADDRESS_SHIP_STREET', 'ADDRESS_SHIP_STATE', 'ADDRESS_SHIP_POSTCODE', 'ADDRESS_SHIP_COUNTRY'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['CUSTOMFIELDS'][] = (object) [
                    'FIELD_NAME'  => $key,
                    'FIELD_VALUE' => $value
                ];
            }
        }

        $this->type = 'Organisation';
        $this->typeName = 'Organisation created';

        $apiEndpoint = 'https://api.' . $this->apiUrl . '/v3.1/Organisations';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['FIRST_NAME']) || empty($finalData['EMAIL_ADDRESS'])) {
            return ['success' => false, 'message' => __('Required field Name or Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['FIRST_NAME', 'LAST_NAME', 'TITLE', 'EMAIL_ADDRESS', 'PHONE', 'DATE_OF_BIRTH', 'SOCIAL_FACEBOOK', 'SOCIAL_LINKEDIN', 'SOCIAL_TWITTER', 'ADDRESS_MAIL_STREET', 'ADDRESS_MAIL_CITY', 'ADDRESS_MAIL_STATE', 'ADDRESS_MAIL_COUNTRY', 'ADDRESS_MAIL_POSTCODE', 'ADDRESS_OTHER_STREET', 'ADDRESS_OTHER_STATE', 'ADDRESS_OTHER_POSTCODE', 'ADDRESS_OTHER_COUNTRY'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['CUSTOMFIELDS'][] = (object) [
                    'FIELD_NAME'  => $key,
                    'FIELD_VALUE' => $value
                ];
            }
        }

        if ($this->integrationDetails->actions->organisation) {
            $requestParams['ORGANISATION_ID'] = $this->integrationDetails->selectedOrganisation;
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        $apiEndpoint = 'https://api.' . $this->apiUrl . '/v3.1/Contacts';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addOpportunity($finalData)
    {
        if (empty($finalData['OPPORTUNITY_NAME'])) {
            return ['success' => false, 'message' => __('Required field opportunity name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['OPPORTUNITY_NAME', 'OPPORTUNITY_DETAILS', 'BID_AMOUNT', 'ACTUAL_CLOSE_DATE', 'PROBABILITY', 'FORECAST_CLOSE_DATE'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['CUSTOMFIELDS'][] = (object) [
                    'FIELD_NAME'  => $key,
                    'FIELD_VALUE' => $value
                ];
            }
        }

        if ($this->integrationDetails->actions->organisation) {
            $requestParams['ORGANISATION_ID'] = $this->integrationDetails->selectedOrganisation;
        }

        if ($this->integrationDetails->actions->selectedCRMPipeline) {
            $requestParams['PIPELINE_ID'] = $this->integrationDetails->selectedCRMPipeline;
        }

        if ($this->integrationDetails->actions->selectedCRMPipelineStages) {
            $requestParams['STAGE_ID'] = $this->integrationDetails->selectedCRMPipelineStages;
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';

        $apiEndpoint = 'https://api.' . $this->apiUrl . '/v3.1/Opportunities';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addProject($finalData)
    {
        if (empty($finalData['PROJECT_NAME'])) {
            return ['success' => false, 'message' => __('Required field opportunity name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['PROJECT_NAME', 'PROJECT_DETAILS', 'BID_AMOUNT', 'ACTUAL_CLOSE_DATE', 'PROBABILITY', 'FORECAST_CLOSE_DATE'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['CUSTOMFIELDS'][] = (object) [
                    'FIELD_NAME'  => $key,
                    'FIELD_VALUE' => $value
                ];
            }
        }

        if ($this->integrationDetails->actions->organisation) {
            $requestParams['ORGANISATION_ID'] = $this->integrationDetails->selectedOrganisation;
        }

        if ($this->integrationDetails->actions->selectedCRMPipeline) {
            $requestParams['PIPELINE_ID'] = $this->integrationDetails->selectedCRMPipeline;
        }

        if ($this->integrationDetails->actions->selectedCRMPipelineStages) {
            $requestParams['STAGE_ID'] = $this->integrationDetails->selectedCRMPipelineStages;
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';

        $apiEndpoint = 'https://api.' . $this->apiUrl . '/v3.1/Opportunities';

        return $response = HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addTask($finalData)
    {
        if (empty($finalData['TITLE'])) {
            return ['success' => false, 'message' => __('Required field opportunity name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['TITLE', 'DUE_DATE', 'COMPLETED_DATE_UTC', 'DETAILS', 'PERCENT_COMPLETE', 'START_DATE'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['CUSTOMFIELDS'][] = (object) [
                    'FIELD_NAME'  => $key,
                    'FIELD_VALUE' => $value
                ];
            }
        }

        if ($this->integrationDetails->actions->category) {
            $requestParams['CATEGORY_ID'] = $this->integrationDetails->selectedCategory;
        }

        $this->type = 'Task';
        $this->typeName = 'Task created';

        $apiEndpoint = 'https://api.' . $this->apiUrl . '/v3.1/Tasks';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function addLead($finalData)
    {
        if (empty($finalData['LAST_NAME'])) {
            return ['success' => false, 'message' => __('Required field opportunity name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['FIRST_NAME', 'LAST_NAME', 'TITLE', 'ORGANISATION_NAME', 'LEAD_RATING', 'EMAIL', 'PHONE', 'MOBILE', 'FAX', 'WEBSITE', 'INDUSTRY', 'EMPLOYEE_COUNT', 'ADDRESS_STREET', 'ADDRESS_CITY', 'ADDRESS_STATE', 'ADDRESS_POSTCODE', 'ADDRESS_COUNTRY', 'LEAD_DESCRIPTION'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['CUSTOMFIELDS'][] = (object) [
                    'FIELD_NAME'  => $key,
                    'FIELD_VALUE' => $value
                ];
            }
        }

        if ($this->integrationDetails->actions->category) {
            $requestParams['CATEGORY_ID'] = $this->integrationDetails->selectedCategory;
        }
        if ($this->integrationDetails->actions->category) {
            $requestParams['LEAD_SOURCE_ID'] = $this->integrationDetails->selectedLeadStatus;
        }
        if ($this->integrationDetails->actions->category) {
            $requestParams['LEAD_STATUS_ID'] = $this->integrationDetails->selectedLeadSource;
        }

        $this->type = 'Lead';
        $this->typeName = 'Lead created';

        $apiEndpoint = 'https://api.' . $this->apiUrl . '/v3.1/Leads';

        return HttpHelper::post($apiEndpoint, wp_json_encode($requestParams), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->insightlyFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'CUSTOMFIELDS') {
                    $dataFinal[$value->customFieldKey] = $value->customValue;
                } else {
                    $dataFinal[$actionValue] = $value->customValue;
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'CUSTOMFIELDS') {
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
        if ($actionName === 'organisation') {
            $apiResponse = $this->addOrganisation($finalData);
        } elseif ($actionName === 'contact') {
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'opportunity') {
            $apiResponse = $this->addOpportunity($finalData);
        } elseif ($actionName === 'task') {
            $apiResponse = $this->addTask($finalData);
        } elseif ($actionName === 'lead') {
            $apiResponse = $this->addLead($finalData);
        }

        if ($apiResponse->CONTACT_ID || $apiResponse->status === 'success') {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
