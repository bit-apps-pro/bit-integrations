<?php

namespace BitApps\Integrations\Actions\NiroHelp;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const ACTION_CONFIG_SETTINGS = [
        'change_ticket_status' => ['status' => 'status'],
        'assign_agent'         => ['agentId' => 'agent_id'],
        'set_sentiment'        => ['sentiment' => 'sentiment'],
        'add_reply'            => ['replyBy' => 'reply_by'],
        'create_doc'           => ['authorId' => 'author_id'],
    ];

    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!\defined('NIROHELP_VERSION')) {
            return [
                'success' => false,
                'message' => __('NiroHelp is not activated or not installed', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_ticket';
        $settings = $this->settings($mainAction, $utilities);

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_ticket':
                $response = Hooks::apply(Config::withPrefix('niro_help_create_ticket'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'update_ticket':
                $response = Hooks::apply(Config::withPrefix('niro_help_update_ticket'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'change_ticket_status':
                $response = Hooks::apply(Config::withPrefix('niro_help_change_ticket_status'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'assign_agent':
                $response = Hooks::apply(Config::withPrefix('niro_help_assign_agent'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'set_sentiment':
                $response = Hooks::apply(Config::withPrefix('niro_help_set_sentiment'), $defaultResponse, $fieldData, $settings);
                $type = 'ticket';

                break;

            case 'delete_ticket':
                $response = Hooks::apply(Config::withPrefix('niro_help_delete_ticket'), $defaultResponse, $fieldData);
                $type = 'ticket';

                break;

            case 'add_reply':
                $response = Hooks::apply(Config::withPrefix('niro_help_add_reply'), $defaultResponse, $fieldData, $settings);
                $type = 'reply';

                break;

            case 'add_private_note':
                $response = Hooks::apply(Config::withPrefix('niro_help_add_private_note'), $defaultResponse, $fieldData, $settings);
                $type = 'reply';

                break;

            case 'set_follow_up':
                $response = Hooks::apply(Config::withPrefix('niro_help_set_follow_up'), $defaultResponse, $fieldData, $settings);
                $type = 'follow_up';

                break;

            case 'clear_follow_up':
                $response = Hooks::apply(Config::withPrefix('niro_help_clear_follow_up'), $defaultResponse, $fieldData);
                $type = 'follow_up';

                break;

            case 'create_doc':
                $response = Hooks::apply(Config::withPrefix('niro_help_create_doc'), $defaultResponse, $fieldData, $settings);
                $type = 'doc';

                break;

            case 'update_doc':
                $response = Hooks::apply(Config::withPrefix('niro_help_update_doc'), $defaultResponse, $fieldData, $settings);
                $type = 'doc';

                break;

            case 'trash_doc':
                $response = Hooks::apply(Config::withPrefix('niro_help_trash_doc'), $defaultResponse, $fieldData);
                $type = 'doc';

                break;

            case 'delete_doc':
                $response = Hooks::apply(Config::withPrefix('niro_help_delete_doc'), $defaultResponse, $fieldData);
                $type = 'doc';

                break;

            case 'create_product':
                $response = Hooks::apply(Config::withPrefix('niro_help_create_product'), $defaultResponse, $fieldData);
                $type = 'product';

                break;

            case 'create_reason':
                $response = Hooks::apply(Config::withPrefix('niro_help_create_reason'), $defaultResponse, $fieldData);
                $type = 'reason';

                break;

            case 'create_topic':
                $response = Hooks::apply(Config::withPrefix('niro_help_create_topic'), $defaultResponse, $fieldData, $settings);
                $type = 'topic';

                break;

            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('niro_help_create_customer'), $defaultResponse, $fieldData);
                $type = 'customer';

                break;

            case 'add_agent':
                $response = Hooks::apply(Config::withPrefix('niro_help_add_agent'), $defaultResponse, $fieldData);
                $type = 'agent';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'NiroHelp';
                $mainAction = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function settings($mainAction, $utilities)
    {
        $settings = [];

        foreach (self::ACTION_CONFIG_SETTINGS[$mainAction] ?? [] as $confKey => $settingKey) {
            if (isset($this->_integrationDetails->{$confKey}) && $this->_integrationDetails->{$confKey} !== '') {
                $settings[$settingKey] = $this->_integrationDetails->{$confKey};
            }
        }

        foreach ((array) $utilities as $key => $value) {
            if (strpos($key, 'selected_') === 0 && $value !== '' && $value !== null) {
                $settings[substr($key, \strlen('selected_'))] = $value;
            }
        }

        return $settings;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->niroHelpField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
