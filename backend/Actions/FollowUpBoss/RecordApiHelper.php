<?php

namespace BitApps\Integrations\Actions\FollowUpBoss;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'action_plan_id',
        'assign_outcome_id',
        'assign_stage_id',
        'assign_to_user_id',
        'assign_type_id',
        'assigned_lender_id',
        'assigned_pond_id',
        'assigned_user_id',
        'campaign_id',
        'collaborators',
        'created_by_id',
        'default_group_id',
        'default_pond_id',
        'default_user_id',
        'distribution',
        'event_type',
        'field_type',
        'group_type',
        'invited_user_ids',
        'is_incoming',
        'leader_ids',
        'move_to_team_id',
        'outcome',
        'outcome_id',
        'person_assigned_user_id',
        'person_stage',
        'plan_status',
        'ref_type',
        'stage',
        'stage_id',
        'task_type',
        'timeframe_id',
        'type_id',
        'user_id',
        'user_ids',
        'users',
    ];

    private $_integrationID;

    private $_integrationDetails;

    private $apiClient;

    public function __construct($integrationDetails, $integId, ApiClient $apiClient)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
        $this->apiClient = $apiClient;
    }

    public function execute($fieldValues, $fieldMap)
    {
        $fieldData = static::generateReqDataFromFieldMap($fieldValues, $fieldMap);
        $mainAction = $this->_integrationDetails->mainAction ?? '';
        $settings = $this->settings();
        $default = [
            'success' => false,
            // translators: %s is the plugin name.
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro'),
            'code'    => 400,
        ];

        switch ($mainAction) {
            case 'create_person':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_person'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_person':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_person'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_person':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_person'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_event':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_relationship':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_relationship'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_relationship':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_relationship'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_relationship':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_relationship'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_note':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_note':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_note':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_note'), $default, $fieldData, $this->apiClient);

                break;

            case 'log_call':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_log_call'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_call':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_call'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_user':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_user'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'apply_action_plan':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_apply_action_plan'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_action_plan_status':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_action_plan_status'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_email_template':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_email_template'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_email_template':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_email_template'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_email_template':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_email_template'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_text_message_template':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_text_message_template'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_text_message_template':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_text_message_template'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_text_message_template':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_text_message_template'), $default, $fieldData, $this->apiClient);

                break;

            case 'log_email_marketing_event':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_log_email_marketing_event'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_email_campaign':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_email_campaign'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_email_campaign':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_email_campaign'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_custom_field':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_custom_field'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_custom_field':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_custom_field'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_custom_field':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_custom_field'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_stage':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_stage'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_stage':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_stage'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_stage':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_stage'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_task':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_task':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_task'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_task':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_task'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_appointment':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_appointment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_appointment':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_appointment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_appointment':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_appointment'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_appointment_type':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_appointment_type'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_appointment_type':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_appointment_type'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_appointment_type':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_appointment_type'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_appointment_outcome':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_appointment_outcome'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_appointment_outcome':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_appointment_outcome'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_appointment_outcome':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_appointment_outcome'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_pipeline':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_pipeline'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_pipeline':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_pipeline'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_pipeline':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_pipeline'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_deal':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_deal'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_deal':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_deal'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_deal':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_deal'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_deal_custom_field':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_deal_custom_field'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_deal_custom_field':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_deal_custom_field'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_deal_custom_field':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_deal_custom_field'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_group':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_group':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_group':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_group'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_team':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_team'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_team':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_team'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_team':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_team'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_pond':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_create_pond'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_pond':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_update_pond'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_pond':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_delete_pond'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_reaction':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_add_reaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_reaction':
                $response = Hooks::apply(Config::withPrefix('follow_up_boss_remove_reaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('The action is not valid. Select a Follow Up Boss action.', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'FollowUpBoss', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $followUpBossField = $map->followUpBossField ?? '';

            if (empty($followUpBossField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$followUpBossField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$followUpBossField] = $fieldValues[$triggerField];
            }
        }

        return $data;
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
}
