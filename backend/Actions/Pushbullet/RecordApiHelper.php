<?php

namespace BitApps\Integrations\Actions\Pushbullet;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = ['target_device_iden', 'channel_tag', 'source_device_iden', 'muted'];

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
            case 'send_note':
                $response = Hooks::apply(Config::withPrefix('pushbullet_send_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_link':
                $response = Hooks::apply(Config::withPrefix('pushbullet_send_link'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_file':
                $response = Hooks::apply(Config::withPrefix('pushbullet_send_file'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'dismiss_push':
                $response = Hooks::apply(Config::withPrefix('pushbullet_dismiss_push'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_push':
                $response = Hooks::apply(Config::withPrefix('pushbullet_delete_push'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_all_pushes':
                $response = Hooks::apply(Config::withPrefix('pushbullet_delete_all_pushes'), $default, $this->apiClient);

                break;

            case 'send_text':
                $response = Hooks::apply(Config::withPrefix('pushbullet_send_text'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'cancel_text':
                $response = Hooks::apply(Config::withPrefix('pushbullet_cancel_text'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_device':
                $response = Hooks::apply(Config::withPrefix('pushbullet_create_device'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_device':
                $response = Hooks::apply(Config::withPrefix('pushbullet_update_device'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_device':
                $response = Hooks::apply(Config::withPrefix('pushbullet_delete_device'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_chat':
                $response = Hooks::apply(Config::withPrefix('pushbullet_create_chat'), $default, $fieldData, $this->apiClient);

                break;

            case 'mute_chat':
                $response = Hooks::apply(Config::withPrefix('pushbullet_mute_chat'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_chat':
                $response = Hooks::apply(Config::withPrefix('pushbullet_delete_chat'), $default, $fieldData, $this->apiClient);

                break;

            case 'subscribe_channel':
                $response = Hooks::apply(Config::withPrefix('pushbullet_subscribe_channel'), $default, $fieldData, $this->apiClient);

                break;

            case 'mute_subscription':
                $response = Hooks::apply(Config::withPrefix('pushbullet_mute_subscription'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'unsubscribe_channel':
                $response = Hooks::apply(Config::withPrefix('pushbullet_unsubscribe_channel'), $default, $fieldData, $this->apiClient);

                break;

            case 'mirror_notification':
                $response = Hooks::apply(Config::withPrefix('pushbullet_mirror_notification'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'dismiss_notification':
                $response = Hooks::apply(Config::withPrefix('pushbullet_dismiss_notification'), $default, $fieldData, $this->apiClient);

                break;

            case 'send_ephemeral':
                $response = Hooks::apply(Config::withPrefix('pushbullet_send_ephemeral'), $default, $fieldData, $this->apiClient);

                break;

            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Pushbullet', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $pushbulletField = $map->pushbulletField ?? '';

            if ($pushbulletField === 'customFieldKey') {
                $pushbulletField = trim($map->customFieldKey ?? '');
            }

            if (empty($pushbulletField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$pushbulletField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$pushbulletField] = $fieldValues[$triggerField];
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
