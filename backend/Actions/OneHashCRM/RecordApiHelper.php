<?php

/**
 * OneHashCRM Record Api
 */

namespace BitApps\Integrations\Actions\OneHashCRM;

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

    public function __construct($integrationDetails, $integId, $apiKey, $apiSecret, $domain)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = "{$domain}/api/resource";
        $this->defaultHeader = [
            'Authorization' => "token {$apiKey}:{$apiSecret}",
            'Content-type'  => 'application/json',
        ];
    }

    public function addCustomer($finalData)
    {
        if (empty($finalData['customer_name'])) {
            return ['success' => false, 'message' => __('Required field Full Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedCustomerType) || empty($this->integrationDetails->selectedCustomerType)) {
            return ['success' => false, 'message' => __('Required field Customer Type is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['customer_type'] = $this->integrationDetails->selectedCustomerType;
        $finalData['customer_group'] = 'All Customer Groups';
        $finalData['territory'] = 'All Territories';
        $this->type = 'Customer';
        $this->typeName = 'Customer created';
        $apiEndpoint = $this->apiUrl . '/Customer';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['first_name'])) {
            return ['success' => false, 'message' => __('Required field First Name is empty', 'bit-integrations'), 'code' => 400];
        }

        if (isset($this->integrationDetails->selectedContactStatus) && !empty($this->integrationDetails->selectedContactStatus)) {
            $finalData['status'] = ($this->integrationDetails->selectedContactStatus);
        }

        if (isset($finalData['email_id'])) {
            $finalData['email_ids'] = [
                (object) [
                    'email_id'   => $finalData['email_id'],
                    'is_primary' => true
                ]
            ];
        }
        if (isset($finalData['phone'])) {
            $finalData['phone_nos'][] = (object) [
                'phone'            => $finalData['phone'],
                'is_primary_phone' => true
            ];
        }
        if (isset($finalData['mobile_no'])) {
            $finalData['phone_nos'][] = (object) [
                'phone'                => $finalData['mobile_no'],
                'is_primary_mobile_no' => true
            ];
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';
        $apiEndpoint = $this->apiUrl . '/Contact';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addLead($finalData)
    {
        if (empty($finalData['lead_name'])) {
            return ['success' => false, 'message' => __('Required Person Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (empty($finalData['company_name'])) {
            return ['success' => false, 'message' => __('Required Organization Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedLeadStatus) || empty($this->integrationDetails->selectedLeadStatus)) {
            return ['success' => false, 'message' => __('Required Lead Status is empty', 'bit-integrations'), 'code' => 400];
        }

        if (isset($this->integrationDetails->selectedLeadSource) && !empty($this->integrationDetails->selectedLeadSource)) {
            $finalData['source'] = ($this->integrationDetails->selectedLeadSource);
        }
        if (isset($this->integrationDetails->actions->organizationLead) && !empty($this->integrationDetails->actions->organizationLead)) {
            $finalData['organization_lead'] = $this->integrationDetails->actions->organizationLead;
        }
        if (isset($this->integrationDetails->selectedLeadAddressType) && !empty($this->integrationDetails->selectedLeadAddressType)) {
            $finalData['address_type'] = $this->integrationDetails->selectedLeadAddressType;
        }
        if (isset($this->integrationDetails->selectedLeadType) && !empty($this->integrationDetails->selectedLeadType)) {
            $finalData['type'] = $this->integrationDetails->selectedLeadType;
        }
        if (isset($this->integrationDetails->selectedRequestType) && !empty($this->integrationDetails->selectedRequestType)) {
            $finalData['request_type'] = $this->integrationDetails->selectedRequestType;
        }
        if (isset($this->integrationDetails->selectedMarketSegment) && !empty($this->integrationDetails->selectedMarketSegment)) {
            $finalData['market_segment'] = $this->integrationDetails->selectedMarketSegment;
        }

        $finalData['status'] = $this->integrationDetails->selectedLeadStatus;
        $finalData['territory'] = 'All Territories';
        $this->type = 'Lead';
        $this->typeName = 'Lead created';
        $apiEndpoint = $this->apiUrl . '/Lead';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->oneHashCRMFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
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
        }

        if (isset($apiResponse->data)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
