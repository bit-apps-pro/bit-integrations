<?php

/**
 * CompanyHub Record Api
 */

namespace BitApps\Integrations\Actions\CompanyHub;

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

    public function __construct($integrationDetails, $integId, $subDomain, $apiKey)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://api.companyhub.com/v1';
        $this->defaultHeader = [
            'Authorization' => "{$subDomain} {$apiKey}",
            'Content-Type'  => 'application/json'
        ];
    }

    public function addContact($finalData)
    {
        $this->type = 'Contact';
        $this->typeName = 'Contact created';

        if (empty($finalData['LastName'])) {
            return ['success' => false, 'message' => __('Required field Last Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (isset($this->integrationDetails->selectedCompany) && !empty($this->integrationDetails->selectedCompany)) {
            $finalData['Company'] = $this->integrationDetails->selectedCompany;
        }
        if (isset($this->integrationDetails->selectedSource) && !empty($this->integrationDetails->selectedSource)) {
            $finalData['Source'] = $this->integrationDetails->selectedSource;
        }

        $apiEndpoint = $this->apiUrl . '/tables/contact';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addCompany($finalData)
    {
        $this->type = 'Company';
        $this->typeName = 'Company created';

        if (empty($finalData['Name'])) {
            return ['success' => false, 'message' => __('Required field Company Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $apiEndpoint = $this->apiUrl . '/tables/company';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function addDeal($finalData)
    {
        $this->type = 'Deal';
        $this->typeName = 'Deal created';

        if (empty($finalData['Name'])) {
            return ['success' => false, 'message' => __('Required field Deal Name is empty', 'bit-integrations'), 'code' => 400];
        }
        if (!isset($this->integrationDetails->selectedStage) || empty($this->integrationDetails->selectedStage)) {
            return ['success' => false, 'message' => 'Required field Last Name is empty', 'code' => 400];
        }

        $finalData['Stage'] = $this->integrationDetails->selectedStage;
        if (isset($this->integrationDetails->selectedCompany) && !empty($this->integrationDetails->selectedCompany)) {
            $finalData['Company'] = $this->integrationDetails->selectedCompany;
        }
        if (isset($this->integrationDetails->selectedContact) && !empty($this->integrationDetails->selectedContact)) {
            $finalData['Contact'] = $this->integrationDetails->selectedContact;
        }

        $apiEndpoint = $this->apiUrl . '/tables/deal';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->companyHubFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? Common::replaceFieldWithValue($value->customValue, $data) : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);

        if ($actionName === 'contact') {
            $apiResponse = $this->addContact($finalData);
        } elseif ($actionName === 'company') {
            $apiResponse = $this->addCompany($finalData);
        } elseif ($actionName === 'deal') {
            $apiResponse = $this->addDeal($finalData);
        }

        if ($apiResponse->Success) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
