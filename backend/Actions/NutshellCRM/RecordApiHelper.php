<?php

/**
 * NutshellCRM Record Api
 */

namespace BitApps\Integrations\Actions\NutshellCRM;

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

    public function __construct($integrationDetails, $integId, $userName, $apiToken)
    {
        $this->integrationDetails = $integrationDetails;
        $this->integrationId = $integId;
        $this->apiUrl = 'https://app.nutshell.com/api/v1/json';
        $this->defaultHeader = [
            'Authorization' => 'Basic ' . base64_encode("{$userName}:{$apiToken}"),
            'Content-type'  => 'application/json',
        ];
    }

    public function addPeople($finalData)
    {
        if (empty($finalData['first_name'] || $finalData['email'])) {
            return ['success' => false, 'message' => __('Required field First Name or Email is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['first_name', 'email', 'last_name', 'phone', 'address_1', 'city', 'state', 'postalCode', 'country'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'address_1' || $key == 'city' || $key == 'state' || $key == 'postalCode' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } elseif ($key == 'first_name') {
                    $requestParams['name']['givenName'] = $value;
                } elseif ($key == 'last_name') {
                    $requestParams['name']['familyName'] = $value;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['customFields'][] = (object) [
                    $key => $value,
                ];
            }
        }

        if ($this->integrationDetails->actions->Company) {
            $requestParams['accounts'][] = (object) [
                'id' => ($this->integrationDetails->selectedCompany)
            ];
        }

        $this->type = 'People';
        $this->typeName = 'People created';

        $body = [
            'method' => 'newContact',
            'id'     => 'randomstring',
            'params' => (object) [
                'contact' => $requestParams
            ]
        ];

        $apiEndpoint = $this->apiUrl;

        return HttpHelper::post($apiEndpoint, wp_json_encode($body), $this->defaultHeader);
    }

    public function addCompany($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Full Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'url', 'phone', 'address_1', 'city', 'state', 'postalCode', 'country'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'address_1' || $key == 'city' || $key == 'state' || $key == 'postalCode' || $key == 'country')) {
                    $requestParams['address'][$key] = $value;
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['customFields'][] = (object) [
                    $key => $value,
                ];
            }
        }

        if ($this->integrationDetails->actions->Contact) {
            $requestParams['contacts'][] = (object) [
                'id' => ($this->integrationDetails->selectedContact)
            ];
        }
        if ($this->integrationDetails->actions->CompanyType) {
            $requestParams['accountTypeId'] = ($this->integrationDetails->selectedCompanyType);
        }

        $this->type = 'Company';
        $this->typeName = 'Company created';

        $body = [
            'method' => 'newAccount',
            'id'     => 'randomstring',
            'params' => (object) [
                'account' => $requestParams
            ]
        ];

        $apiEndpoint = $this->apiUrl;

        return HttpHelper::post($apiEndpoint, wp_json_encode($body), $this->defaultHeader);
    }

    public function addLead($finalData)
    {
        if (empty($finalData['description'])) {
            return ['success' => false, 'message' => __('Required field Description is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['description', 'dueTime', 'confidence'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['customFields'][] = (object) [
                    $key => $value,
                ];
            }
        }

        if ($this->integrationDetails->actions->Contact) {
            $requestParams['contacts'][] = (object) [
                'id' => ($this->integrationDetails->selectedContact)
            ];
        }
        if ($this->integrationDetails->actions->Company) {
            $requestParams['accounts'][] = (object) [
                'id' => ($this->integrationDetails->selectedCompany)
            ];
        }
        if ($this->integrationDetails->actions->Product) {
            $requestParams['products'][] = (object) [
                'id' => ($this->integrationDetails->selectedProduct)
            ];
        }
        if ($this->integrationDetails->actions->Source) {
            $requestParams['sources'][] = (object) [
                'id' => ($this->integrationDetails->selectedSource)
            ];
        }
        if ($this->integrationDetails->actions->Tag) {
            $requestParams['tags'][] = ($this->integrationDetails->selectedTag);
        }

        if ($this->integrationDetails->actions->Priority) {
            $requestParams['priority'] = (int) ($this->integrationDetails->actions->Priority);
        }

        $this->type = 'Lead';
        $this->typeName = 'Lead created';

        $body = [
            'method' => 'newLead',
            'id'     => 'randomstring',
            'params' => (object) [
                'lead' => $requestParams
            ]
        ];

        $apiEndpoint = $this->apiUrl;

        return HttpHelper::post($apiEndpoint, wp_json_encode($body), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->nutshellCRMFormField;
            $dataFinal[$actionValue] = ($triggerValue === 'custom') ? $value->customValue : $data[$triggerValue];
        }

        return $dataFinal;
    }

    public function execute($fieldValues, $fieldMap, $actionName)
    {
        $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap);
        if ($actionName === 'people') {
            $apiResponse = $this->addPeople($finalData);
        } elseif ($actionName === 'company') {
            $apiResponse = $this->addCompany($finalData);
        } elseif ($actionName === 'lead') {
            $apiResponse = $this->addLead($finalData);
        }

        if (isset($apiResponse->result)) {
            $res = [$this->typeName . '  successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
