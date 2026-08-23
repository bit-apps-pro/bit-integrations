<?php

/**
 * CapsuleCRM Record Api
 */

namespace BitApps\Integrations\Actions\CapsuleCRM;

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
        $this->apiUrl = 'https://api.capsulecrm.com/api/v2';
        $this->defaultHeader = [
            'Authorization' => 'Bearer ' . $integrationDetails->api_key,
            'Content-Type'  => 'application/json'
        ];
    }

    public function addOrganisation($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field Name is empty', 'bit-integrations'), 'code' => 400];
        }

        $staticFieldsKeys = ['name', 'emailAddresses', 'about', 'street', 'city', 'state', 'zip', 'country',  'websites', 'phoneNumbers'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'street' || $key == 'city' || $key == 'state' || $key == 'zip' || $key == 'country')) {
                    $requestParams['addresses'][] = (object) [
                        $key => $value
                    ];
                } elseif (($key == 'websites')) {
                    $requestParams['websites'][] = (object) [
                        'url' => $value
                    ];
                } elseif ($key == 'emailAddresses') {
                    $requestParams[$key][] = (object) [
                        'address' => $value
                    ];
                } elseif ($key == 'phoneNumbers') {
                    $requestParams[$key][] = (object) [
                        'number' => $value
                    ];
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        if ($this->integrationDetails->actions->owner) {
            $requestParams['owner'][] = [
                'id' => (int) ($this->integrationDetails->selectedOwner),
            ];
        }
        if ($this->integrationDetails->actions->team) {
            $requestParams['team'] = (int) ($this->integrationDetails->selectedTeam);
        }

        $requestParams['type'] = 'organisation';

        $this->type = 'Organisation';
        $this->typeName = 'Organisation created';

        $apiEndpoint = $this->apiUrl . '/parties';

        return HttpHelper::post($apiEndpoint, wp_json_encode(['party' => $requestParams]), $this->defaultHeader);
    }

    public function addPerson($finalData)
    {
        if (empty($finalData['firstName'])) {
            return ['success' => false, 'message' => 'Required field Name is empty', 'code' => 400];
        }

        $staticFieldsKeys = ['firstName', 'lastName', 'title', 'jobTitle', 'emailAddresses', 'about', 'street', 'city', 'state', 'zip', 'country',  'websites', 'phoneNumbers'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if (($key == 'street' || $key == 'city' || $key == 'state' || $key == 'zip' || $key == 'country')) {
                    $requestParams['addresses'][] = (object) [
                        $key => $value
                    ];
                } elseif (($key == 'websites')) {
                    $requestParams['websites'][] = (object) [
                        'url' => $value
                    ];
                } elseif ($key == 'emailAddresses') {
                    $requestParams[$key][] = (object) [
                        'address' => $value
                    ];
                } elseif ($key == 'phoneNumbers') {
                    $requestParams[$key][] = (object) [
                        'number' => $value
                    ];
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        $requestParams['type'] = 'person';

        if ($this->integrationDetails->actions->organisation) {
            $requestParams['organisation'] = (int) ($this->integrationDetails->selectedOrganisation);
        }
        if ($this->integrationDetails->actions->owner) {
            $requestParams['owner'] = [
                'id' => (int) ($this->integrationDetails->selectedOwner),
            ];
        }
        if ($this->integrationDetails->actions->team) {
            $requestParams['team'] = (int) ($this->integrationDetails->selectedTeam);
        }

        $this->type = 'Person';
        $this->typeName = 'Person created';

        $apiEndpoint = $this->apiUrl . '/parties';

        return HttpHelper::post($apiEndpoint, wp_json_encode(['party' => $requestParams]), $this->defaultHeader);
    }

    public function addOpportunity($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => 'Required field opportunity name is empty', 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'description', 'value', 'expectedCloseOn', 'closedOn', 'value'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                if ($key == 'value') {
                    $requestParams['value'] = (object) [
                        'amount' => (int) $value
                    ];
                } else {
                    $requestParams[$key] = $value;
                }
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        if (!empty($this->integrationDetails->selectedCRMParty)) {
            $requestParams['party'] = [
                'id' => (int) ($this->integrationDetails->selectedCRMParty),
            ];
        }
        if (!empty($this->integrationDetails->selectedCRMMilestones)) {
            $requestParams['milestone'] = [
                'id' => (int) ($this->integrationDetails->selectedCRMMilestones),
            ];
        }
        if ($this->integrationDetails->actions->owner) {
            $requestParams['owner'] = [
                'id' => (int) ($this->integrationDetails->selectedOwner),
            ];
        }
        if ($this->integrationDetails->actions->team) {
            $requestParams['team'] = (int) ($this->integrationDetails->selectedTeam);
        }
        if (!empty($this->integrationDetails->actions->currency)) {
            $requestParams['value']->currency = ($this->integrationDetails->selectedCurrency);
        }

        $this->type = 'Opportunity';
        $this->typeName = 'Opportunity created';

        $apiEndpoint = $this->apiUrl . '/opportunities';

        return HttpHelper::post($apiEndpoint, wp_json_encode(['opportunity' => $requestParams]), $this->defaultHeader);
    }

    public function addProject($finalData)
    {
        if (empty($finalData['name'])) {
            return ['success' => false, 'message' => __('Required field project name is empty', 'bit-integrations'), 'code' => 400];
        }
        $staticFieldsKeys = ['name', 'description', 'expectedCloseOn'];

        foreach ($finalData as $key => $value) {
            if (\in_array($key, $staticFieldsKeys)) {
                $requestParams[$key] = $value;
            } else {
                $requestParams['fields'][] = (object) [
                    'value'      => $value,
                    'definition' => (object) ['id' => $key]
                ];
            }
        }

        if (!empty($this->integrationDetails->selectedCRMParty)) {
            $requestParams['party'] = [
                'id' => (int) ($this->integrationDetails->selectedCRMParty),
            ];
        }
        if ($this->integrationDetails->actions->owner) {
            $requestParams['owner'] = [
                'id' => (int) ($this->integrationDetails->selectedOwner),
            ];
        }
        if ($this->integrationDetails->actions->opportunity) {
            $requestParams['opportunity'] = [
                'id' => (int) ($this->integrationDetails->selectedOpportunity),
            ];
        }
        if ($this->integrationDetails->actions->team) {
            $requestParams['team'] = (int) ($this->integrationDetails->selectedTeam);
        }

        $this->type = 'Project';
        $this->typeName = 'Project created';

        $apiEndpoint = $this->apiUrl . '/kases';

        return HttpHelper::post($apiEndpoint, wp_json_encode(['kase' => $requestParams]), $this->defaultHeader);
    }

    public function generateReqDataFromFieldMap($data, $fieldMap)
    {
        $dataFinal = [];
        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->capsulecrmFormField;
            if ($triggerValue === 'custom') {
                if ($actionValue === 'fields') {
                    $dataFinal[$value->customFieldKey] = $value->customValue;
                } else {
                    $dataFinal[$actionValue] = $value->customValue;
                }
            } elseif (!\is_null($data[$triggerValue])) {
                if ($actionValue === 'fields') {
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
        } elseif ($actionName === 'person') {
            $apiResponse = $this->addPerson($finalData);
        } elseif ($actionName === 'opportunity') {
            $apiResponse = $this->addOpportunity($finalData);
        } elseif ($actionName === 'project') {
            $apiResponse = $this->addProject($finalData);
        }

        if (isset($apiResponse->kase->id) || isset($apiResponse->opportunity->id) || isset($apiResponse->party->id) || isset($apiResponse->data->id) || $apiResponse->status === 'success') {
            $res = [$this->typeName . ' successfully'];
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->typeName]), 'success', wp_json_encode($res));
        } else {
            LogHandler::save($this->integrationId, wp_json_encode(['type' => $this->type, 'type_name' => $this->type . ' creating']), 'error', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }
}
