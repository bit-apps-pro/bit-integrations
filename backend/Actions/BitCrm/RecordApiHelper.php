<?php

/**
 * Bit CRM Record Api
 */

namespace BitApps\Integrations\Actions\BitCrm;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, update
 */
class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID      = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!class_exists('BitApps\Crm\Config')) {
            return ['success' => false, 'message' => __('Bit CRM is not installed or activated', 'bit-integrations')];
        }

        $fieldData  = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_lead';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'create_lead':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_lead'), $defaultResponse, $fieldData);
                $type       = 'lead';
                $actionType = 'create_lead';

                break;

            case 'update_lead':
                $response = Hooks::apply(Config::withPrefix('bitcrm_update_lead'), $defaultResponse, $fieldData);
                $type       = 'lead';
                $actionType = 'update_lead';

                break;

            case 'delete_lead':
                $response = Hooks::apply(Config::withPrefix('bitcrm_delete_lead'), $defaultResponse, $fieldData);
                $type       = 'lead';
                $actionType = 'delete_lead';

                break;

            case 'add_tag_to_lead':
                $response = Hooks::apply(Config::withPrefix('bitcrm_add_tag_to_lead'), $defaultResponse, $fieldData);
                $type       = 'lead';
                $actionType = 'add_tag_to_lead';

                break;

            case 'remove_tag_from_lead':
                $response = Hooks::apply(Config::withPrefix('bitcrm_remove_tag_from_lead'), $defaultResponse, $fieldData);
                $type       = 'lead';
                $actionType = 'remove_tag_from_lead';

                break;

            case 'create_contact':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_contact'), $defaultResponse, $fieldData);
                $type       = 'contact';
                $actionType = 'create_contact';

                break;

            case 'update_contact':
                $response = Hooks::apply(Config::withPrefix('bitcrm_update_contact'), $defaultResponse, $fieldData);
                $type       = 'contact';
                $actionType = 'update_contact';

                break;

            case 'delete_contact':
                $response = Hooks::apply(Config::withPrefix('bitcrm_delete_contact'), $defaultResponse, $fieldData);
                $type       = 'contact';
                $actionType = 'delete_contact';

                break;

            case 'add_tag_to_contact':
                $response = Hooks::apply(Config::withPrefix('bitcrm_add_tag_to_contact'), $defaultResponse, $fieldData);
                $type       = 'contact';
                $actionType = 'add_tag_to_contact';

                break;

            case 'remove_tag_from_contact':
                $response = Hooks::apply(Config::withPrefix('bitcrm_remove_tag_from_contact'), $defaultResponse, $fieldData);
                $type       = 'contact';
                $actionType = 'remove_tag_from_contact';

                break;

            case 'create_company':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_company'), $defaultResponse, $fieldData);
                $type       = 'company';
                $actionType = 'create_company';

                break;

            case 'update_company':
                $response = Hooks::apply(Config::withPrefix('bitcrm_update_company'), $defaultResponse, $fieldData);
                $type       = 'company';
                $actionType = 'update_company';

                break;

            case 'delete_company':
                $response = Hooks::apply(Config::withPrefix('bitcrm_delete_company'), $defaultResponse, $fieldData);
                $type       = 'company';
                $actionType = 'delete_company';

                break;

            case 'add_tag_to_company':
                $response = Hooks::apply(Config::withPrefix('bitcrm_add_tag_to_company'), $defaultResponse, $fieldData);
                $type       = 'company';
                $actionType = 'add_tag_to_company';

                break;

            case 'remove_tag_from_company':
                $response = Hooks::apply(Config::withPrefix('bitcrm_remove_tag_from_company'), $defaultResponse, $fieldData);
                $type       = 'company';
                $actionType = 'remove_tag_from_company';

                break;

            case 'create_deal':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_deal'), $defaultResponse, $fieldData);
                $type       = 'deal';
                $actionType = 'create_deal';

                break;

            case 'update_deal':
                $response = Hooks::apply(Config::withPrefix('bitcrm_update_deal'), $defaultResponse, $fieldData);
                $type       = 'deal';
                $actionType = 'update_deal';

                break;

            case 'delete_deal':
                $response = Hooks::apply(Config::withPrefix('bitcrm_delete_deal'), $defaultResponse, $fieldData);
                $type       = 'deal';
                $actionType = 'delete_deal';

                break;

            case 'add_tag_to_deal':
                $response = Hooks::apply(Config::withPrefix('bitcrm_add_tag_to_deal'), $defaultResponse, $fieldData);
                $type       = 'deal';
                $actionType = 'add_tag_to_deal';

                break;

            case 'remove_tag_from_deal':
                $response = Hooks::apply(Config::withPrefix('bitcrm_remove_tag_from_deal'), $defaultResponse, $fieldData);
                $type       = 'deal';
                $actionType = 'remove_tag_from_deal';

                break;

            case 'create_product':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_product'), $defaultResponse, $fieldData);
                $type       = 'product';
                $actionType = 'create_product';

                break;

            case 'update_product':
                $response = Hooks::apply(Config::withPrefix('bitcrm_update_product'), $defaultResponse, $fieldData);
                $type       = 'product';
                $actionType = 'update_product';

                break;

            case 'delete_product':
                $response = Hooks::apply(Config::withPrefix('bitcrm_delete_product'), $defaultResponse, $fieldData);
                $type       = 'product';
                $actionType = 'delete_product';

                break;

            case 'add_tag_to_product':
                $response = Hooks::apply(Config::withPrefix('bitcrm_add_tag_to_product'), $defaultResponse, $fieldData);
                $type       = 'product';
                $actionType = 'add_tag_to_product';

                break;

            case 'remove_tag_from_product':
                $response = Hooks::apply(Config::withPrefix('bitcrm_remove_tag_from_product'), $defaultResponse, $fieldData);
                $type       = 'product';
                $actionType = 'remove_tag_from_product';

                break;

            case 'update_deal_stage':
                $response = Hooks::apply(Config::withPrefix('bitcrm_update_deal_stage'), $defaultResponse, $fieldData);
                $type       = 'deal';
                $actionType = 'update_deal_stage';

                break;

            case 'convert_lead':
                $response = Hooks::apply(Config::withPrefix('bitcrm_convert_lead'), $defaultResponse, $fieldData);
                $type       = 'lead';
                $actionType = 'convert_lead';

                break;

            case 'create_tag':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_tag'), $defaultResponse, $fieldData);
                $type       = 'tag';
                $actionType = 'create_tag';

                break;

            case 'create_note':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_note'), $defaultResponse, $fieldData);
                $type       = 'note';
                $actionType = 'create_note';

                break;

            case 'create_activity':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_activity'), $defaultResponse, $fieldData);
                $type       = 'activity';
                $actionType = 'create_activity';

                break;

            case 'create_invoice':
                $response = Hooks::apply(Config::withPrefix('bitcrm_create_invoice'), $defaultResponse, $fieldData);
                $type       = 'invoice';
                $actionType = 'create_invoice';

                break;
            default:
                $response   = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $type       = 'BitCrm';
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
            $actionValue  = $item->bitCrmField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
