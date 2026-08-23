<?php

/**
 * PerfexCRM Record Api
 */

namespace BitApps\Integrations\Actions\PerfexCRM;

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

    public function __construct($integrationDetails, $integId, $apiToken, $domain)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = "{$domain}/api";
        $this->defaultHeader = [
            'authtoken'    => $apiToken,
            'Content-type' => 'application/json',
            'Content-type' => 'application/x-www-form-urlencoded',
        ];
    }

    public function addCustomer($finalData)
    {
        if (empty($finalData['company'])) {
            return ['success' => false, 'message' => __('Required field Company is empty', 'bit-integrations'), 'code' => 400];
        }

        $this->type = 'Customer';
        $this->typeName = 'Customer created';
        $apiEndpoint = $this->apiUrl . '/customers';

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['firstname'])) {
            return ['success' => false, 'message' => __('Required field First Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (empty($finalData['lastname'])) {
            return ['success' => false, 'message' => __('Required field Last Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedCustomer) && empty($this->integrationDetails->selectedCustomer)) {
            return ['success' => false, 'message' => __('Required field Customer is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['customer_id'] = ($this->integrationDetails->selectedCustomer);
        $finalData['send_set_password_email'] = 'on';

        if (isset($this->integrationDetails->selectedDirection) && !empty($this->integrationDetails->selectedDirection)) {
            $finalData['direction'] = ($this->integrationDetails->selectedDirection);
        }
        if (isset($this->integrationDetails->selectedPermission) && !empty($this->integrationDetails->selectedPermission)) {
            $finalData['permissions'] = explode(',', $this->integrationDetails->selectedPermission);
        }
        if (isset($this->integrationDetails->actions->contactIsPrimary) && !empty($this->integrationDetails->actions->contactIsPrimary)) {
            $finalData['is_primary'] = $this->integrationDetails->actions->contactIsPrimary ? 'on' : $this->integrationDetails->actions->contactIsPrimary;
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';
        $apiEndpoint = $this->apiUrl . '/contacts';

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function addLead($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedLeadStatusId) && empty($this->integrationDetails->selectedLeadStatusId)) {
            return ['success' => false, 'message' => __('Required field Lead Status Id is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedLeadSourceId) && empty($this->integrationDetails->selectedLeadSourceId)) {
            return ['success' => false, 'message' => __('Required field Lead Source Id is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedStaff) && empty($this->integrationDetails->selectedStaff)) {
            return ['success' => false, 'message' => __('Required field Lead Assigned By is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['status'] = $this->integrationDetails->selectedLeadStatusId;
        $finalData['source'] = $this->integrationDetails->selectedLeadSourceId;
        $finalData['assigned'] = $this->integrationDetails->selectedStaff;

        if (isset($this->integrationDetails->selectedCustomer) && !empty($this->integrationDetails->selectedCustomer)) {
            $finalData['client_id'] = ($this->integrationDetails->selectedCustomer);
        }
        if (isset($this->integrationDetails->actions->leadIsPublic) && !empty($this->integrationDetails->actions->leadIsPublic)) {
            $finalData['is_public'] = $this->integrationDetails->actions->leadIsPublic;
        }
        if (isset($this->integrationDetails->actions->contactedToday) && !empty($this->integrationDetails->actions->contactedToday)) {
            $finalData['contacted_today'] = $this->integrationDetails->actions->contactedToday;
        }
        $this->type = 'Lead';
        $this->typeName = 'Lead created';
        $apiEndpoint = $this->apiUrl . '/leads';

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function addProject($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (empty($finalData['start_date'])) {
            return ['success' => false, 'message' => __('Required field Start Date is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedProjectStatus) && empty($this->integrationDetails->selectedProjectStatus)) {
            return ['success' => false, 'message' => __('Required field Project Status is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedProjectType) && empty($this->integrationDetails->selectedProjectType)) {
            return ['success' => false, 'message' => __('Required field Project Type is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedbillingType) && empty($this->integrationDetails->selectedbillingType)) {
            return ['success' => false, 'message' => __('Required field Billing Type is empty', 'bit-integrations'), 'code' => 400];
        } elseif (isset($this->integrationDetails->selectedCustomer) && empty($this->integrationDetails->selectedCustomer)) {
            return ['success' => false, 'message' => __('Required field Customer is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['status'] = $this->integrationDetails->selectedProjectStatus;
        $finalData['rel_type'] = $this->integrationDetails->selectedProjectType;
        $finalData['billing_type'] = $this->integrationDetails->selectedbillingType;
        $finalData['clientid'] = $this->integrationDetails->selectedCustomer;

        if ($this->integrationDetails->selectedbillingType === 1) {
            $finalData['project_cost'] = $this->integrationDetails->totalRate;
        } elseif ($this->integrationDetails->selectedbillingType === 2) {
            $finalData['project_rate_per_hour'] = $this->integrationDetails->ratePerHour;
        }

        if (isset($this->integrationDetails->selectedProjectMembers) && !empty($this->integrationDetails->selectedProjectMembers)) {
            $finalData['project_members'] = explode(',', $this->integrationDetails->selectedProjectMembers);
        }

        $this->type = 'Project';
        $this->typeName = 'Project created';
        $apiEndpoint = $this->apiUrl . '/projects';

        return HttpHelper::post($apiEndpoint, $finalData, $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->perfexCRMFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom' && !empty($value->customValue)) ? Common::replaceFieldWithValue($value->customValue, $data) : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'customer') {
            $apiResponse = $this->addCustomer($finalData);
        } elseif ($actionName === 'contact') {
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'lead') {
            $apiResponse = $this->addLead($finalData);
        } elseif ($actionName === 'project') {
            $apiResponse = $this->addProject($finalData);
        }

        if (!empty($apiResponse->status)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
