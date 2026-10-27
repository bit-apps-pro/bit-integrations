<?php

namespace BitApps\Integrations\Actions\WpActivityLog;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
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

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!WpActivityLogController::isPluginActive()) {
            return [
                'success' => false,
                'message' => __('WP Activity Log is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? '';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'log_event':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_log_event'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'event';

                break;

            case 'delete_event':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_delete_event'), $defaultResponse, $fieldData);
                $type = 'event';

                break;

            case 'delete_events':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_delete_events'), $defaultResponse, $fieldData, $utilities);
                $type = 'event';

                break;

            case 'delete_events_older_than':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_delete_events_older_than'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'event';

                break;

            case 'enable_event':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_enable_event'), $defaultResponse, $fieldData);
                $type = 'event_setting';

                break;

            case 'disable_event':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_disable_event'), $defaultResponse, $fieldData);
                $type = 'event_setting';

                break;

            case 'exclude_user':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_user'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_user_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_user_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'exclude_role':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_role'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_role_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_role_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'exclude_ip_address':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_ip_address'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_ip_address_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_ip_address_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'exclude_post_type':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_post_type'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_post_type_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_post_type_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'exclude_post_status':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_post_status'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_post_status_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_post_status_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'exclude_post_meta_field':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_post_meta_field'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_post_meta_field_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_post_meta_field_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'exclude_user_meta_field':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_exclude_user_meta_field'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            case 'remove_user_meta_field_exclusion':
                $response = Hooks::apply(Config::withPrefix('wp_activity_log_remove_user_meta_field_exclusion'), $defaultResponse, $fieldData);
                $type = 'exclusion';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'WpActivityLog';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ((array) $fieldMap as $item) {
            $triggerValue = $item->formField ?? '';
            $actionValue = $item->wpActivityLogField ?? '';

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
