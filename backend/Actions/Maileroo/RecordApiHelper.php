<?php

namespace BitApps\Integrations\Actions\Maileroo;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'domain_id',
        'template_id',
        'domain_type',
        'expression_type',
        'template_type',
        'authorized_domains',
        'outbound_ips',
        'domains',
        'event_types',
    ];

    private const CUSTOM_KEY_GROUPS = [
        'customTag'              => 'tags',
        'customHeader'           => 'headers',
        'customTemplateVariable' => 'template_data',
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
            case 'send_email':
                $response = Hooks::apply(Config::withPrefix('maileroo_send_email'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_templated_email':
                $response = Hooks::apply(Config::withPrefix('maileroo_send_templated_email'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_scheduled_email':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_scheduled_email'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_domain':
                $response = Hooks::apply(Config::withPrefix('maileroo_add_domain'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_domain':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_domain'), $default, $fieldData, $this->apiClient);

                break;

            case 'scan_dns_records':
                $response = Hooks::apply(Config::withPrefix('maileroo_scan_dns_records'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_domain_settings':
                $response = Hooks::apply(Config::withPrefix('maileroo_update_domain_settings'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'rename_sending_key':
                $response = Hooks::apply(Config::withPrefix('maileroo_rename_sending_key'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_sending_key':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_sending_key'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_smtp_account':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_smtp_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_inbound_route':
                $response = Hooks::apply(Config::withPrefix('maileroo_create_inbound_route'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_inbound_route':
                $response = Hooks::apply(Config::withPrefix('maileroo_update_inbound_route'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_inbound_route':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_inbound_route'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'resend_email':
                $response = Hooks::apply(Config::withPrefix('maileroo_resend_email'), $default, $fieldData, $this->apiClient);

                break;

            case 'add_suppression':
                $response = Hooks::apply(Config::withPrefix('maileroo_add_suppression'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_suppression':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_suppression'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_template':
                $response = Hooks::apply(Config::withPrefix('maileroo_create_template'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'rename_template':
                $response = Hooks::apply(Config::withPrefix('maileroo_rename_template'), $default, $fieldData, $this->apiClient);

                break;

            case 'delete_template':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_template'), $default, $fieldData, $this->apiClient);

                break;

            case 'update_application':
                $response = Hooks::apply(Config::withPrefix('maileroo_update_application'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_application':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_application'), $default, $fieldData, $this->apiClient);

                break;

            case 'create_webhook':
                $response = Hooks::apply(Config::withPrefix('maileroo_create_webhook'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_webhook':
                $response = Hooks::apply(Config::withPrefix('maileroo_update_webhook'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_webhook':
                $response = Hooks::apply(Config::withPrefix('maileroo_delete_webhook'), $default, $fieldData, $this->apiClient);

                break;

            default:
                $response = ['success' => false, 'message' => __('The action is not valid. Select a Maileroo action.', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Maileroo', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $mailerooField = $map->mailerooField ?? '';

            if ($triggerField === 'custom') {
                $value = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif ($triggerField !== '' && isset($fieldValues[$triggerField])) {
                $value = $fieldValues[$triggerField];
            } else {
                continue;
            }

            if (isset(self::CUSTOM_KEY_GROUPS[$mailerooField])) {
                $customKey = trim($map->customFieldKey ?? '');

                if ($customKey !== '') {
                    $data[self::CUSTOM_KEY_GROUPS[$mailerooField]][$customKey] = $value;
                }

                continue;
            }

            if ($mailerooField !== '') {
                $data[$mailerooField] = $value;
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
