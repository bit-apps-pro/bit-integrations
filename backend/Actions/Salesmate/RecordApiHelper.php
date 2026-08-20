<?php

/**
 * Salesmate Record Api
 */

namespace BitApps\Integrations\Actions\Salesmate;

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

    public function __construct($integrationDetails, $integId, $sessionToken, $linkName)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = "https://{$linkName}.salesmate.io/apis/";
        $this->defaultHeader
            = [
                'Content-type' => 'application/json',
                'accessToken'  => $sessionToken,
                'x-linkname'   => $linkName . '.salesmate.io',
            ];
    }

    public function addProduct($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        } elseif (empty($finalData['unitPrice'])) {
            return ['success' => false, 'message' => __('Required field unit Price is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['isActive'] = isset($this->integrationDetails->selectedIsActive) && !empty($this->integrationDetails->selectedIsActive) ? $this->integrationDetails->selectedIsActive : 1;
        $finalData['currency'] = isset($this->integrationDetails->selectedCurrency) && !empty($this->integrationDetails->selectedCurrency) ? $this->integrationDetails->selectedCurrency : 'USD';

        if (isset($this->integrationDetails->selectedTag)) {
            $finalData['tags'] = ($this->integrationDetails->selectedTag);
        }
        if (isset($this->integrationDetails->selectedCRMOwner)) {
            $finalData['owner'] = ($this->integrationDetails->selectedCRMOwner);
        }

        $this->type = 'Product';
        $this->typeName = 'Product created';
        $apiEndpoint = $this->apiUrl . 'v1/products';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addContact($finalData)
    {
        if (empty($finalData['lastName'])) {
            return ['success' => false, 'message' => __('Required field lastName is empty', 'bit-integrations'), 'code' => 400];
        }

        if (isset($this->integrationDetails->selectedTag) && !empty($this->integrationDetails->selectedTag)) {
            $finalData['tags'] = ($this->integrationDetails->selectedTag);
        }
        if (isset($this->integrationDetails->selectedType) && !empty($this->integrationDetails->selectedType)) {
            $finalData['type'] = ($this->integrationDetails->selectedType);
        }
        if (isset($this->integrationDetails->selectedCRMOwner) && !empty($this->integrationDetails->selectedCRMOwner)) {
            $finalData['owner'] = ($this->integrationDetails->selectedCRMOwner);
        }

        $this->type = 'Contact';
        $this->typeName = 'Contact created';
        $apiEndpoint = $this->apiUrl . 'contact/v4';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addCompany($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field name is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['currency'] = isset($this->integrationDetails->selectedCurrency) && !empty($this->integrationDetails->selectedCurrency) ? $this->integrationDetails->selectedCurrency : 'USD';

        if (isset($this->integrationDetails->selectedTag) && !empty($this->integrationDetails->selectedTag)) {
            $finalData['tags'] = ($this->integrationDetails->selectedTag);
        }
        if (isset($this->integrationDetails->selectedType) && !empty($this->integrationDetails->selectedType)) {
            $finalData['type'] = ($this->integrationDetails->selectedType);
        }
        if (isset($this->integrationDetails->selectedCRMOwner) && !empty($this->integrationDetails->selectedCRMOwner)) {
            $finalData['owner'] = ($this->integrationDetails->selectedCRMOwner);
        }

        $this->type = 'Company';
        $this->typeName = 'Company created';
        $apiEndpoint = $this->apiUrl . 'company/v4';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addDeal($finalData)
    {
        if (empty($finalData['title'])) {
            return ['success' => false, 'message' => __('Required field title is empty', 'bit-integrations'), 'code' => 400];
        }

        $finalData['currency'] = isset($this->integrationDetails->selectedCurrency) && !empty($this->integrationDetails->selectedCurrency) ? $this->integrationDetails->selectedCurrency : 'USD';
        $finalData['status'] = isset($this->integrationDetails->selectedStatus) && !empty($this->integrationDetails->selectedStatus) ? $this->integrationDetails->selectedStatus : 'Open';
        $finalData['source'] = isset($this->integrationDetails->selectedSource) && !empty($this->integrationDetails->selectedSource) ? $this->integrationDetails->selectedSource : 'Ads';
        $finalData['priority'] = isset($this->integrationDetails->selectedPriority) && !empty($this->integrationDetails->selectedPriority) ? $this->integrationDetails->selectedPriority : 'High';

        if (isset($this->integrationDetails->selectedTag) && !empty($this->integrationDetails->selectedTag)) {
            $finalData['tags'] = ($this->integrationDetails->selectedTag);
        }
        if (isset($this->integrationDetails->selectedType) && !empty($this->integrationDetails->selectedType)) {
            $finalData['type'] = ($this->integrationDetails->selectedType);
        }
        if (isset($this->integrationDetails->selectedCRMContact) && !empty($this->integrationDetails->selectedCRMContact)) {
            $finalData['primaryContact'] = ($this->integrationDetails->selectedCRMContact);
        }
        if (isset($this->integrationDetails->selectedCRMOwner) && !empty($this->integrationDetails->selectedCRMOwner)) {
            $finalData['owner'] = ($this->integrationDetails->selectedCRMOwner);
        }
        if (isset($this->integrationDetails->selectedCRMPipeline) && !empty($this->integrationDetails->selectedCRMPipeline)) {
            $finalData['pipeline'] = ($this->integrationDetails->selectedCRMPipeline);
        }
        if (isset($this->integrationDetails->selectedCRMStage) && !empty($this->integrationDetails->selectedCRMStage)) {
            $finalData['stage'] = ($this->integrationDetails->selectedCRMStage);
        }

        $this->type = 'Deal';
        $this->typeName = 'Deal created';
        $apiEndpoint = $this->apiUrl . 'deal/v4';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->salesmateFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionId)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ((int) $actionId === 1) {
            $apiResponse = $this->addContact($finalData);
        } elseif ((int) $actionId === 4) {
            $apiResponse = $this->addDeal($finalData);
        } elseif ((int) $actionId === 5) {
            $apiResponse = $this->addCompany($finalData);
        } elseif ((int) $actionId === 6) {
            $apiResponse = $this->addProduct($finalData);
        }

        if ($apiResponse->Status === 'success') {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
