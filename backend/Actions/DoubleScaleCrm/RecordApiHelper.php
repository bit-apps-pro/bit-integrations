<?php

namespace BitApps\Integrations\Actions\DoubleScaleCrm;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'owner_id',
        'tag_ids',
        'list_ids',
        'list_id',
        'channel',
        'status',
    ];

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap)
    {
        if (!DoubleScaleCrmController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('DoubleScale CRM is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $settings = $this->settings();
        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_contact':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_contact'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'update_contact':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_update_contact'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'create_or_update_contact':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_or_update_contact'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'delete_contact':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_delete_contact'), $defaultResponse, $fieldData);
                $type = 'contact';

                break;

            case 'change_contact_owner':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_change_contact_owner'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'subscribe_contact_to_channel':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_subscribe_contact_to_channel'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'unsubscribe_contact_from_channel':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_unsubscribe_contact_from_channel'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'create_tag':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_tag'), $defaultResponse, $fieldData);
                $type = 'contact';

                break;

            case 'add_tags_to_contact':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_add_tags_to_contact'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'remove_tags_from_contact':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_remove_tags_from_contact'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'create_list':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_list'), $defaultResponse, $fieldData);
                $type = 'contact';

                break;

            case 'add_contact_to_lists':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_add_contact_to_lists'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'remove_contact_from_lists':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_remove_contact_from_lists'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'unsubscribe_contact_from_list':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_unsubscribe_contact_from_list'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'resubscribe_contact_to_list':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_resubscribe_contact_to_list'), $defaultResponse, $fieldData, $settings);
                $type = 'contact';

                break;

            case 'create_ticket':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_ticket'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'update_ticket':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_update_ticket'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'add_ticket_reply':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_add_ticket_reply'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'add_ticket_note':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_add_ticket_note'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'delete_ticket':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_delete_ticket'), $defaultResponse, $fieldData);
                $type = 'ticket';

                break;

            case 'create_invoice':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_invoice'), $defaultResponse, $fieldData, $settings);
                $type = 'invoice';

                break;

            case 'update_invoice':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_update_invoice'), $defaultResponse, $fieldData);
                $type = 'invoice';

                break;

            case 'change_invoice_status':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_change_invoice_status'), $defaultResponse, $fieldData, $settings);
                $type = 'invoice';

                break;

            case 'send_invoice':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_send_invoice'), $defaultResponse, $fieldData);
                $type = 'invoice';

                break;

            case 'record_invoice_payment':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_record_invoice_payment'), $defaultResponse, $fieldData, $settings);
                $type = 'invoice';

                break;

            case 'delete_invoice':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_delete_invoice'), $defaultResponse, $fieldData);
                $type = 'invoice';

                break;

            case 'create_proposal':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_create_proposal'), $defaultResponse, $fieldData, $settings);
                $type = 'proposal';

                break;

            case 'update_proposal':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_update_proposal'), $defaultResponse, $fieldData);
                $type = 'proposal';

                break;

            case 'send_proposal':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_send_proposal'), $defaultResponse, $fieldData);
                $type = 'proposal';

                break;

            case 'accept_proposal':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_accept_proposal'), $defaultResponse, $fieldData);
                $type = 'proposal';

                break;

            case 'decline_proposal':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_decline_proposal'), $defaultResponse, $fieldData);
                $type = 'proposal';

                break;

            case 'convert_proposal_to_invoice':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_convert_proposal_to_invoice'), $defaultResponse, $fieldData);
                $type = 'proposal';

                break;

            case 'delete_proposal':
                $response = Hooks::apply(Config::withPrefix('double_scale_crm_delete_proposal'), $defaultResponse, $fieldData);
                $type = 'proposal';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'DoubleScaleCrm';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function settings()
    {
        $details = $this->_integrationDetails;
        $settings = [];

        foreach (self::SETTING_KEYS as $key) {
            if (isset($details->{$key}) && $details->{$key} !== '' && $details->{$key} !== []) {
                $settings[$key] = $details->{$key};
            }
        }

        foreach ((array) ($details->utilities ?? []) as $key => $value) {
            if ($value !== '' && $value !== null && $value !== []) {
                $settings[preg_replace('/^selected_/', '', (string) $key)] = $value;
            }
        }

        return $settings;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->doubleScaleCrmField ?? '';

            if (empty($triggerValue) || empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
