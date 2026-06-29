<?php

namespace BitApps\Integrations\Actions\MainWP;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

if (!defined('ABSPATH')) {
    exit;
}

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
        if (!class_exists('\MainWP\Dashboard\MainWP_DB')) {
            return [
                'success' => false,
                'message' => __('MainWP Dashboard is not installed or activated', 'bit-integrations'),
            ];
        }

        if (empty($this->_integrationDetails)) {
            return [
                'success' => false,
                'message' => __('Integration details are missing', 'bit-integrations'),
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'sync_site';

        if (!empty($this->_integrationDetails->selectedSite)) {
            $fieldData['site_id'] = (int) $this->_integrationDetails->selectedSite;
        }

        if (\in_array($mainAction, ['create_post', 'update_post'], true)) {
            $utils = (array) ($this->_integrationDetails->utilities ?? []);
            if (!empty($utils['post_type'])) {
                $fieldData['post_type'] = sanitize_text_field($utils['post_type']);
            }
            if (!empty($utils['post_status'])) {
                $fieldData['post_status'] = sanitize_text_field($utils['post_status']);
            }
        }

        $defaultResponse = [
            'success' => false,
            // translators: %s is the plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro'),
        ];

        switch ($mainAction) {
            case 'sync_site':
                $response = Hooks::apply(Config::withPrefix('main_wp_sync_site'), $defaultResponse, $fieldData);
                $actionType = 'sync_site';

                break;

            case 'sync_all_sites':
                $response = Hooks::apply(Config::withPrefix('main_wp_sync_all_sites'), $defaultResponse);
                $actionType = 'sync_all_sites';

                break;

            case 'create_post':
                $response = Hooks::apply(Config::withPrefix('main_wp_create_post'), $defaultResponse, $fieldData);
                $actionType = 'create_post';

                break;

            case 'update_post':
                $response = Hooks::apply(Config::withPrefix('main_wp_update_post'), $defaultResponse, $fieldData);
                $actionType = 'update_post';

                break;

            case 'delete_post':
                $response = Hooks::apply(Config::withPrefix('main_wp_delete_post'), $defaultResponse, $fieldData);
                $actionType = 'delete_post';

                break;

            case 'activate_plugin':
                $response = Hooks::apply(Config::withPrefix('main_wp_activate_plugin'), $defaultResponse, $fieldData);
                $actionType = 'activate_plugin';

                break;

            case 'deactivate_plugin':
                $response = Hooks::apply(Config::withPrefix('main_wp_deactivate_plugin'), $defaultResponse, $fieldData);
                $actionType = 'deactivate_plugin';

                break;

            case 'create_user':
                $response = Hooks::apply(Config::withPrefix('main_wp_create_user'), $defaultResponse, $fieldData);
                $actionType = 'create_user';

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $actionType = 'unknown';

                break;
        }

        if (is_wp_error($response)) {
            $response = [
                'success' => false,
                'message' => $response->get_error_message(),
            ];
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'MainWP', 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues): array
    {
        $data = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->mainWPField;

            if (empty($actionValue) || (empty($triggerValue) && $triggerValue !== 'custom')) {
                continue;
            }

            $data[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $data;
    }
}
