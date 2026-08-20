<?php

/**
 * HubSpot Record Api
 */

namespace BitApps\Integrations\Actions\Hubspot;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\HttpHelper;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class HubspotRecordApiHelper
{
    private $defaultHeader;

    public function __construct($accessToken)
    {
        $this->defaultHeader = [
            'Content-Type'  => 'application/json',
            'authorization' => "Bearer {$accessToken}"
        ];
    }

    public function generateReqDataFromFieldMap($data, $fieldMap, $integrationDetails)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->hubspotField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = \is_array($data[$triggerValue]) ? implode(';', $data[$triggerValue]) : $data[$triggerValue];
            }
        }

        $dataFinal = array_merge($dataFinal, static::setActions($integrationDetails));

        return $dataFinal;
    }

    public function formatDealFieldMap($data, $fieldMap, $integrationDetails)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->hubspotField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                if (!\is_array($data[$triggerValue]) && strtotime($data[$triggerValue])) {
                    $formated = strtotime($data[$triggerValue]);
                    $dataFinal[$actionValue] = $formated;
                } else {
                    $dataFinal[$actionValue] = \is_array($data[$triggerValue]) ? implode(';', $data[$triggerValue]) : $data[$triggerValue];
                }
            }
        }

        if (!empty($integrationDetails->pipeline)) {
            $dataFinal['pipeline'] = $integrationDetails->pipeline;
        }
        if (!empty($integrationDetails->stage)) {
            $dataFinal['dealstage'] = $integrationDetails->stage;
        }

        $dataForAssosciations = [];

        if (isset($integrationDetails->company)) {
            $companyIds = explode(',', $integrationDetails->company);
            $dataForAssosciations['associatedCompanyIds'] = $companyIds;
        }

        if (isset($integrationDetails->contact)) {
            $contactIds = explode(',', $integrationDetails->contact);
            $dataForAssosciations['associatedVids'] = $contactIds;
        }

        $finalData = [];
        $finalData['properties'] = array_merge($dataFinal, static::setActions($integrationDetails));

        if (!empty($dataForAssosciations)) {
            $finalData['associations'] = $dataForAssosciations;
        }

        return $finalData;
    }

    public function formatTicketFieldMap($data, $fieldMap, $integrationDetails)
    {
        $dataFinal = [];

        foreach ($fieldMap as $value) {
            $triggerValue = $value->formField;
            $actionValue = $value->hubspotField;
            if ($triggerValue === 'custom') {
                $dataFinal[$actionValue] = Common::replaceFieldWithValue($value->customValue, $data);
            } elseif (!\is_null($data[$triggerValue])) {
                $dataFinal[$actionValue] = \is_array($data[$triggerValue]) ? implode(';', $data[$triggerValue]) : $data[$triggerValue];
            }
        }

        if (!empty($integrationDetails->pipeline)) {
            $dataFinal['hs_pipeline'] = $integrationDetails->pipeline;
        }
        if (!empty($integrationDetails->stage)) {
            $dataFinal['hs_pipeline_stage'] = $integrationDetails->stage;
        }

        $dataFinal = array_merge($dataFinal, static::setActions($integrationDetails));

        return $dataFinal;
    }

    public function executeRecordApi($integId, $integrationDetails, $fieldValues, $fieldMap)
    {
        $actionName = $integrationDetails->actionName;
        $update = isset($integrationDetails->actions->update) ? $integrationDetails->actions->update : false;
        $type = '';
        $typeName = '';

        if ($actionName === 'contact' || $actionName === 'company') {
            $finalData = $this->generateReqDataFromFieldMap($fieldValues, $fieldMap, $integrationDetails);
            $type = $actionName;
            $typeName = "{$actionName}-add";
            $apiResponse = $this->handleContactOrCompany($finalData, $actionName, $typeName, $update);
        } elseif ($actionName === 'deal') {
            $type = 'deal';
            $typeName = 'deal-add';
            $finalData = $this->formatDealFieldMap($fieldValues, $fieldMap, $integrationDetails);
            $apiResponse = $this->handleDeal($finalData, $typeName, $update);
        } elseif ($actionName === 'ticket') {
            $type = 'ticket';
            $typeName = 'ticket-add';
            $finalData = $this->formatTicketFieldMap($fieldValues, $fieldMap, $integrationDetails);
            $apiResponse = $this->handleTicket($finalData, $typeName, $update);
        }

        if (!isset($apiResponse->properties)) {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'error', wp_json_encode($apiResponse));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => $type, 'type_name' => $typeName]), 'success', wp_json_encode($apiResponse));
        }

        return $apiResponse;
    }

    private function handleTicket($data, &$typeName, $update = false)
    {
        $finalData = ['properties' => $data];

        if ($update) {
            $id = $this->existsEntity('tickets', 'subject', $data['subject']);

            return empty($id)
                ? $this->insertTicket($finalData, $typeName)
                : $this->updateEntity($id, $finalData, 'tickets', $typeName);
        }

        return $this->insertTicket($finalData, $typeName);
    }

    private function insertTicket($finalData, &$typeName)
    {
        $typeName = 'Ticket-add';
        $apiEndpoint = 'https://api.hubapi.com/crm/v3/objects/tickets';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    private function handleDeal($finalData, &$typeName, $update = false)
    {
        if ($update) {
            $id = $this->existsEntity('deals', 'dealname', $finalData['dealname']);

            return empty($id)
                ? $this->insertDeal($finalData, $typeName)
                : $this->updateEntity($id, $finalData, 'deals', $typeName);
        }

        return $this->insertDeal($finalData, $typeName);
    }

    private function insertDeal($finalData, &$typeName)
    {
        $typeName = 'Deal-add';
        $apiEndpoint = 'https://api.hubapi.com/crm/v3/objects/deals';

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    private function handleContactOrCompany($data, $actionName, &$typeName, $update = false)
    {
        $finalData = ['properties' => $data];
        $actionName = $actionName === 'contact' ? 'contacts' : 'companies';

        if ($update) {
            $identifier = $actionName === 'contacts' ? $data['email'] : $data['name'];
            $idProperty = $actionName === 'contacts' ? 'email' : 'name';
            $id = $this->existsEntity($actionName, $idProperty, $identifier);

            return empty($id)
                ? $this->insertContactOrCompany($finalData, $actionName, $typeName)
                : $this->updateEntity($id, $finalData, $actionName, $typeName);
        }

        return $this->insertContactOrCompany($finalData, $actionName, $typeName);
    }

    private function existsEntity($actionName, $idProperty, $identifier)
    {
        $apiEndpoint = "https://api.hubapi.com/crm/v3/objects/{$actionName}/search";
        $data = [
            'query'      => $identifier,
            'properties' => [$idProperty]
        ];

        $response = HttpHelper::post($apiEndpoint, wp_json_encode($data), $this->defaultHeader);

        if (is_wp_error($response) || empty($response->results) || (isset($response->status) && $response->status == 'error')) {
            return;
        }

        return $response->results[0]->id ?? false;
    }

    private function insertContactOrCompany($finalData, $actionName, &$typeName)
    {
        $typeName = "{$actionName}-add";
        $apiEndpoint = "https://api.hubapi.com/crm/v3/objects/{$actionName}";

        return HttpHelper::post($apiEndpoint, wp_json_encode($finalData), $this->defaultHeader);
    }

    private function updateEntity($id, $finalData, $actionName, &$typeName)
    {
        $typeName = "{$actionName}-update";
        $response = Hooks::apply(Config::withPrefix('hubspot_update_entity'), $id, $finalData, $actionName, $this->defaultHeader);

        /**
         * @deprecated 2.7.8 Use `bit_integrations_hubspot_update_entity` filter instead.
         * @since 2.7.8
         */
        $response = Hooks::apply('btcbi_hubspot_update_entity', $response, $id, $finalData, $actionName, $this->defaultHeader);

        if (\is_string($response) && $response == $id) {
            // translators: %s: Plugin name
            return (object) ['errors' => wp_sprintf(__('%s is not active or not installed', 'bit-integrations'), 'Bit Integrations Pro')];
        }

        return $response;
    }

    private static function setActions($integrationDetails)
    {
        $actions = [];

        if (isset($integrationDetails->contact_owner)) {
            $actions['hubspot_owner_id'] = $integrationDetails->contact_owner;
        }

        if ($integrationDetails->actionName === 'contact' || $integrationDetails->actionName === 'company') {
            if (isset($integrationDetails->lead_status)) {
                $actions['hs_lead_status'] = $integrationDetails->lead_status;
            }

            if (isset($integrationDetails->lifecycle_stage)) {
                $actions['lifecyclestage'] = $integrationDetails->lifecycle_stage;
            }
        }

        if ($integrationDetails->actionName === 'company') {
            if (isset($integrationDetails->company_type)) {
                $actions['type'] = $integrationDetails->company_type;
            }

            if (isset($integrationDetails->industry)) {
                $actions['industry'] = $integrationDetails->industry;
            }
        }

        if ($integrationDetails->actionName === 'company') {
            if (isset($integrationDetails->deal_type)) {
                $dealType = $integrationDetails->deal_type;
                $actions['dealtype'] = $dealType;
            }

            if (isset($integrationDetails->priority)) {
                $priority = $integrationDetails->priority;
                $actions['hs_priority'] = $priority;
            }
        }

        if ($integrationDetails->actionName === 'ticket' && isset($integrationDetails->priority)) {
            $priority = $integrationDetails->priority;
            if ($priority == 'low') {
                $priority = 'LOW';
            } elseif ($priority == 'medium') {
                $priority = 'MEDIUM';
            } else {
                $priority = 'HIGH';
            }
            $actions['hs_ticket_priority'] = $priority;
        }

        return $actions;
    }
}
