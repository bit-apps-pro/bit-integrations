<?php

/**
 * Bit CRM Record Api
 */

namespace BitApps\Integrations\Actions\BitCrm;

use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap)
    {
        if (!class_exists('BitApps\Crm\Config')) {
            return ['success' => false, 'message' => __('Bit CRM is not installed or activated', 'bit-integrations')];
        }

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_lead';
        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $fieldData = $this->mergeConfiguredValues($fieldData, $mainAction);

        switch ($mainAction) {
            case 'create_lead':
                $response = BitCrmActionHelper::createLead($fieldData);
                $type = 'lead';
                $actionType = 'create_lead';

                break;

            case 'update_lead':
                $response = BitCrmActionHelper::updateLead($fieldData);
                $type = 'lead';
                $actionType = 'update_lead';

                break;

            case 'delete_lead':
                $response = BitCrmActionHelper::deleteLead($fieldData);
                $type = 'lead';
                $actionType = 'delete_lead';

                break;

            case 'add_tag_to_lead':
                $response = BitCrmActionHelper::addTagToLead($fieldData);
                $type = 'lead';
                $actionType = 'add_tag_to_lead';

                break;

            case 'remove_tag_from_lead':
                $response = BitCrmActionHelper::removeTagFromLead($fieldData);
                $type = 'lead';
                $actionType = 'remove_tag_from_lead';

                break;

            case 'create_contact':
                $response = BitCrmActionHelper::createContact($fieldData);
                $type = 'contact';
                $actionType = 'create_contact';

                break;

            case 'update_contact':
                $response = BitCrmActionHelper::updateContact($fieldData);
                $type = 'contact';
                $actionType = 'update_contact';

                break;

            case 'delete_contact':
                $response = BitCrmActionHelper::deleteContact($fieldData);
                $type = 'contact';
                $actionType = 'delete_contact';

                break;

            case 'add_tag_to_contact':
                $response = BitCrmActionHelper::addTagToContact($fieldData);
                $type = 'contact';
                $actionType = 'add_tag_to_contact';

                break;

            case 'remove_tag_from_contact':
                $response = BitCrmActionHelper::removeTagFromContact($fieldData);
                $type = 'contact';
                $actionType = 'remove_tag_from_contact';

                break;

            case 'create_company':
                $response = BitCrmActionHelper::createCompany($fieldData);
                $type = 'company';
                $actionType = 'create_company';

                break;

            case 'update_company':
                $response = BitCrmActionHelper::updateCompany($fieldData);
                $type = 'company';
                $actionType = 'update_company';

                break;

            case 'delete_company':
                $response = BitCrmActionHelper::deleteCompany($fieldData);
                $type = 'company';
                $actionType = 'delete_company';

                break;

            case 'add_tag_to_company':
                $response = BitCrmActionHelper::addTagToCompany($fieldData);
                $type = 'company';
                $actionType = 'add_tag_to_company';

                break;

            case 'remove_tag_from_company':
                $response = BitCrmActionHelper::removeTagFromCompany($fieldData);
                $type = 'company';
                $actionType = 'remove_tag_from_company';

                break;

            case 'create_deal':
                $response = BitCrmActionHelper::createDeal($fieldData);
                $type = 'deal';
                $actionType = 'create_deal';

                break;

            case 'update_deal':
                $response = BitCrmActionHelper::updateDeal($fieldData);
                $type = 'deal';
                $actionType = 'update_deal';

                break;

            case 'delete_deal':
                $response = BitCrmActionHelper::deleteDeal($fieldData);
                $type = 'deal';
                $actionType = 'delete_deal';

                break;

            case 'add_tag_to_deal':
                $response = BitCrmActionHelper::addTagToDeal($fieldData);
                $type = 'deal';
                $actionType = 'add_tag_to_deal';

                break;

            case 'remove_tag_from_deal':
                $response = BitCrmActionHelper::removeTagFromDeal($fieldData);
                $type = 'deal';
                $actionType = 'remove_tag_from_deal';

                break;

            case 'create_product':
                $response = BitCrmActionHelper::createProduct($fieldData);
                $type = 'product';
                $actionType = 'create_product';

                break;

            case 'update_product':
                $response = BitCrmActionHelper::updateProduct($fieldData);
                $type = 'product';
                $actionType = 'update_product';

                break;

            case 'delete_product':
                $response = BitCrmActionHelper::deleteProduct($fieldData);
                $type = 'product';
                $actionType = 'delete_product';

                break;

            case 'add_tag_to_product':
                $response = BitCrmActionHelper::addTagToProduct($fieldData);
                $type = 'product';
                $actionType = 'add_tag_to_product';

                break;

            case 'remove_tag_from_product':
                $response = BitCrmActionHelper::removeTagFromProduct($fieldData);
                $type = 'product';
                $actionType = 'remove_tag_from_product';

                break;

            case 'update_deal_stage':
                $response = BitCrmActionHelper::updateDealStage($fieldData);
                $type = 'deal';
                $actionType = 'update_deal_stage';

                break;

            case 'convert_lead':
                $response = BitCrmActionHelper::convertLead($fieldData);
                $type = 'lead';
                $actionType = 'convert_lead';

                break;

            case 'create_tag':
                $response = BitCrmActionHelper::createTag($fieldData);
                $type = 'tag';
                $actionType = 'create_tag';

                break;

            case 'create_note':
                $response = BitCrmActionHelper::createNote($fieldData);
                $type = 'note';
                $actionType = 'create_note';

                break;

            case 'update_tag':
                $response = BitCrmActionHelper::updateTag($fieldData);
                $type = 'tag';
                $actionType = 'update_tag';

                break;

            case 'delete_tag':
                $response = BitCrmActionHelper::deleteTag($fieldData);
                $type = 'tag';
                $actionType = 'delete_tag';

                break;

            case 'update_note':
                $response = BitCrmActionHelper::updateNote($fieldData);
                $type = 'note';
                $actionType = 'update_note';

                break;

            case 'delete_note':
                $response = BitCrmActionHelper::deleteNote($fieldData);
                $type = 'note';
                $actionType = 'delete_note';

                break;

            case 'create_task':
                $response = BitCrmActionHelper::createTask($fieldData);
                $type = 'task';
                $actionType = 'create_task';

                break;

            case 'update_task':
                $response = BitCrmActionHelper::updateTask($fieldData);
                $type = 'task';
                $actionType = 'update_task';

                break;

            case 'update_task_status':
                $response = BitCrmActionHelper::updateTaskStatus($fieldData);
                $type = 'task';
                $actionType = 'update_task_status';

                break;

            case 'delete_task':
                $response = BitCrmActionHelper::deleteTask($fieldData);
                $type = 'task';
                $actionType = 'delete_task';

                break;

            case 'create_meeting':
                $response = BitCrmActionHelper::createMeeting($fieldData);
                $type = 'meeting';
                $actionType = 'create_meeting';

                break;

            case 'update_meeting':
                $response = BitCrmActionHelper::updateMeeting($fieldData);
                $type = 'meeting';
                $actionType = 'update_meeting';

                break;

            case 'update_meeting_status':
                $response = BitCrmActionHelper::updateMeetingStatus($fieldData);
                $type = 'meeting';
                $actionType = 'update_meeting_status';

                break;

            case 'delete_meeting':
                $response = BitCrmActionHelper::deleteMeeting($fieldData);
                $type = 'meeting';
                $actionType = 'delete_meeting';

                break;

            case 'create_call':
                $response = BitCrmActionHelper::createCall($fieldData);
                $type = 'call';
                $actionType = 'create_call';

                break;

            case 'update_call':
                $response = BitCrmActionHelper::updateCall($fieldData);
                $type = 'call';
                $actionType = 'update_call';

                break;

            case 'update_call_status':
                $response = BitCrmActionHelper::updateCallStatus($fieldData);
                $type = 'call';
                $actionType = 'update_call_status';

                break;

            case 'delete_call':
                $response = BitCrmActionHelper::deleteCall($fieldData);
                $type = 'call';
                $actionType = 'delete_call';

                break;

            case 'create_invoice':
                $response = BitCrmActionHelper::createInvoice($fieldData);
                $type = 'invoice';
                $actionType = 'create_invoice';

                break;

            case 'update_invoice':
                $response = BitCrmActionHelper::updateInvoice($fieldData);
                $type = 'invoice';
                $actionType = 'update_invoice';

                break;

            case 'update_invoice_status':
                $response = BitCrmActionHelper::updateInvoiceStatus($fieldData);
                $type = 'invoice';
                $actionType = 'update_invoice_status';

                break;

            case 'delete_invoice':
                $response = BitCrmActionHelper::deleteInvoice($fieldData);
                $type = 'invoice';
                $actionType = 'delete_invoice';

                break;

            case 'grant_portal_access':
                $response = BitCrmActionHelper::grantPortalAccess($fieldData);
                $type = 'client_portal';
                $actionType = 'grant_portal_access';

                break;

            case 'update_portal_access':
                $response = BitCrmActionHelper::updatePortalAccess($fieldData);
                $type = 'client_portal';
                $actionType = 'update_portal_access';

                break;

            case 'update_portal_password':
                $response = BitCrmActionHelper::updatePortalPassword($fieldData);
                $type = 'client_portal';
                $actionType = 'update_portal_password';

                break;

            case 'revoke_portal_access':
                $response = BitCrmActionHelper::revokePortalAccess($fieldData);
                $type = 'client_portal';
                $actionType = 'revoke_portal_access';

                break;
            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $type = 'BitCrm';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->bitCrmField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }

    private function mergeConfiguredValues($fieldData, $mainAction)
    {
        $conf = $this->_integrationDetails;

        $map = [
            'selectedCurrency'  => 'currency',
            'selectedStage'     => 'stage',
            'selectedTermKey'   => 'term_key',
            'selectedEntity'    => 'entity_id',
            'selectedAssignee'  => 'assigned_to',
            'selectedTags'      => 'tag_ids',
            'module'            => 'module',
            'convertTo'         => 'convert_to',
            'moveRelatedDataTo' => 'move_related_data_to',
            'priority'          => 'priority',
            'taxOption'         => 'tax_option',
            'activityStatus'    => 'status',
            'invoiceStatus'     => 'status',
            'capabilities'      => 'capabilities',
        ];

        $exclusive = [
            'activityStatus' => ['update_task_status', 'update_meeting_status', 'update_call_status'],
            'invoiceStatus'  => ['update_invoice', 'update_invoice_status'],
        ];

        foreach ($map as $confKey => $crmKey) {
            if (isset($exclusive[$confKey]) && !\in_array($mainAction, $exclusive[$confKey], true)) {
                continue;
            }

            if (isset($conf->{$confKey}) && $conf->{$confKey} !== '' && $conf->{$confKey} !== []) {
                $fieldData[$crmKey] = $conf->{$confKey};
            }
        }

        if (isset($conf->fieldValues)) {
            foreach ((array) $conf->fieldValues as $crmKey => $value) {
                if ($value === '' || $value === null || $value === []) {
                    continue;
                }

                $fieldData[$crmKey] = $value;
            }
        }

        if (isset($conf->utilities) && \is_object($conf->utilities)) {
            foreach (get_object_vars($conf->utilities) as $utilKey => $utilVal) {
                $fieldData[$utilKey] = $utilVal;
            }
        }

        return $fieldData;
    }
}
