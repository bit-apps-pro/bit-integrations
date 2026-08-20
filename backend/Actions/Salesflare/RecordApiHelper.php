<?php

/**
 * Salesflare Record Api
 */

namespace BitApps\Integrations\Actions\Salesflare;

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

    public function __construct($integrationDetails, $integId, $apiKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://api.salesflare.com';
        $this->defaultHeader = [
            'Authorization' => "Bearer {$apiKey}",
            'Content-type'  => 'application/json',
        ];
    }

    public function addAccount($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Account Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $this->type = 'Account';
        $this->typeName = 'Account created';
        $formData = $this->setData($finalData);
        $apiEndpoint = $this->apiUrl . '/accounts';

        return HttpHelper::post($apiEndpoint, wp_json_encode($formData), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['firstname'])) {
            return ['success' => false, 'message' => __('Required field First Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (empty($finalData['email'])) {
            return ['success' => false, 'message' => __('Required field Email Address is empty', 'bit-integrations'), 'code' => 400];
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';
        $formData = $this->setData($finalData);
        $apiEndpoint = $this->apiUrl . '/contacts';

        return HttpHelper::post($apiEndpoint, wp_json_encode($formData), $this->defaultHeader);
    }

    public function addOpprtunity($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required Opportunity Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedAccount) || empty($this->integrationDetails->selectedAccount)) {
            return ['success' => false, 'message' => __('Required Account field is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedPipeline) || empty($this->integrationDetails->selectedPipeline)) {
            return ['success' => false, 'message' => __('Required Pipeline field is empty', 'bit-integrations'), 'code' => 400];
        } elseif (!isset($this->integrationDetails->selectedStage) || empty($this->integrationDetails->selectedStage)) {
            return ['success' => false, 'message' => __('Required Stage field is empty', 'bit-integrations'), 'code' => 400];
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';
        $formData = $this->setData($finalData);
        $formData['account'] = $this->integrationDetails->selectedAccount;
        $formData['stage'] = $this->integrationDetails->selectedStage;
        $apiEndpoint = $this->apiUrl . '/opportunities';

        return HttpHelper::post($apiEndpoint, wp_json_encode($formData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->salesflareFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'accounts') {
            $apiResponse = $this->addAccount($finalData);
        } elseif ($actionName === 'contacts') {
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'opportunities') {
            $apiResponse = $this->addOpprtunity($finalData);
        }

        if (isset($apiResponse->id)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function setData($finalData)
    {
        $formData = [];
        $customfields = [];
        $addressKeys = ['city', 'country', 'region', 'state_region', 'street', 'zip', '_dirty'];
        foreach ($finalData as $key => $value) {
            if (array_search($key, $addressKeys) !== false) {
                $formData['address'][$key] = $value;
            } elseif (strpos($key, 'custom_field_') !== false) {
                $custom_key = explode('custom_field_', $key);
                $customfields[$custom_key[1]] = $value;
            } else {
                $formData[$key] = $value;
            }
        }

        if (isset($this->integrationDetails->selectedTags) && !empty($this->integrationDetails->selectedTags)) {
            $formData['tags'] = explode(',', $this->integrationDetails->selectedTags);
        }
        if (!empty($customfields)) {
            $formData['custom'] = (object) $customfields;
        }

        return $formData;
    }
}
