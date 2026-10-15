<?php

namespace BitApps\Integrations\Actions\FreshBooks;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'account_id',
        'business_id',
        'client_id',
        'category_id',
        'staff_id',
        'project_id',
        'vendor_id',
        'invoice_id',
        'tax1',
        'tax2',
        'service_id',
        'identity_id',
        'line_category_id',
        'credit_type',
        'project_type',
        'billing_method',
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
            case 'create_invoice':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_invoice':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_invoice':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_client':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_client'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_client':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_client'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_client':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_client'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_expense':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_expense'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_expense':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_expense'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_expense':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_expense'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_payment':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_payment':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_payment':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_estimate':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_estimate':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_estimate':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_item':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_item':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_item':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_tax':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_tax'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_tax':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_tax'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_tax':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_tax'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_credit_note':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_credit_note':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_credit_note':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_bill':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_bill':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_bill':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_recurring_profile':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_recurring_profile'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_recurring_profile':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_recurring_profile'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_recurring_profile':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_recurring_profile'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_project':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_project'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_project':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_project'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_project':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_project'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_time_entry':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_time_entry'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_time_entry':
                $response = Hooks::apply(Config::withPrefix('fresh_books_update_time_entry'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_time_entry':
                $response = Hooks::apply(Config::withPrefix('fresh_books_delete_time_entry'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_service':
                $response = Hooks::apply(Config::withPrefix('fresh_books_create_service'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('The action is not valid. Select a FreshBooks action.', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'FreshBooks', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $freshBooksField = $map->freshBooksField ?? '';

            if (empty($freshBooksField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$freshBooksField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$freshBooksField] = $fieldValues[$triggerField];
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
