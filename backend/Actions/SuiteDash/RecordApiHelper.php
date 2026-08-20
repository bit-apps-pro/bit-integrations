<?php

/**
 * SuiteDash Record Api
 */

namespace BitApps\Integrations\Actions\SuiteDash;

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

    public function __construct($integrationDetails, $integId, $publicId, $secretKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://app.suitedash.com/secure-api';
        $this->defaultHeader = [
            'accept'       => 'application/json',
            'X-Public-ID'  => $publicId,
            'X-Secret-Key' => $secretKey
        ];
    }

    public function addContact($finalData)
    {
        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        if (empty($finalData['first_name'])) {
            return ['success' => false, 'message' => __('Required field First Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['last_name'])) {
            return ['success' => false, 'message' => __('Required field Last Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email is empty', 'bit-integrations'), 'code' => 400];
        }
        if (!isset($this->integrationDetails->selectedRole) || empty($this->integrationDetails->selectedRole)) {
            return ['success' => false, 'message' => __('Required Role is empty', 'bit-integrations'), 'code' => 400];
        }

        $contactData = ['role' => $this->integrationDetails->selectedRole];
        $customField = [];
        $addressField = [];
        foreach ($finalData as $key => $value) {
            if (stripos($key, 'address-') === false && stripos($key, 'custom-') === false) {
                $contactData[$key] = $value;
            } elseif (stripos($key, 'address-') > -1) {
                $addressField[str_replace('address-', '', $key)] = $value;
            } elseif (stripos($key, 'custom-') > -1) {
                $customField[str_replace('custom-', '', $key)] = $value;
            }
        }

        if (isset($this->integrationDetails->selectedCompany) && !empty($this->integrationDetails->selectedCompany)) {
            $contactData['company'] = (object) [
                'name'                         => $this->integrationDetails->selectedCompany,
                'create_company_if_not_exists' => true
            ];
        }
        if (\count($customField)) {
            $contactData['custom_fields'] = (object) $customField;
        }
        if (\count($addressField)) {
            $contactData['address'] = (object) $addressField;
        }

        $apiEndpoint = $this->apiUrl . '/contact';

        return HttpHelper::post($apiEndpoint, wp_json_encode($contactData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->suiteDashFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'contact') {
            $apiResponse = $this->addContact($finalData);
        }

        if ($apiResponse->success) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
