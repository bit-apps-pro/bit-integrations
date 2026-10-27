<?php

namespace BitApps\Integrations\Actions\QuickBooks;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'account_type',
        'ap_account_id',
        'asset_account_id',
        'billable_status',
        'class_id',
        'credit_account_id',
        'customer_id',
        'debit_account_id',
        'delivery_method',
        'department_id',
        'deposit_account_id',
        'employee_id',
        'entity_type',
        'expense_account_id',
        'from_account_id',
        'income_account_id',
        'item_id',
        'item_type',
        'line_account_id',
        'line_item_id',
        'name_of',
        'parent_id',
        'pay_type',
        'payee_id',
        'payment_account_id',
        'payment_method_id',
        'payment_method_type',
        'payment_type',
        'preferred_vendor_id',
        'status',
        'term_id',
        'to_account_id',
        'vendor_id',
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
            case 'create_customer':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_customer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_customer':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_customer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'deactivate_customer':
                $response = Hooks::apply(Config::withPrefix('quick_books_deactivate_customer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_vendor':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_vendor'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_vendor':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_vendor'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'deactivate_vendor':
                $response = Hooks::apply(Config::withPrefix('quick_books_deactivate_vendor'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_employee':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_employee'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_employee':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_employee'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'deactivate_employee':
                $response = Hooks::apply(Config::withPrefix('quick_books_deactivate_employee'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_item':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_item':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'deactivate_item':
                $response = Hooks::apply(Config::withPrefix('quick_books_deactivate_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_account':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_account':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_invoice':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_invoice':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_invoice':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'void_invoice':
                $response = Hooks::apply(Config::withPrefix('quick_books_void_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_invoice':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_estimate':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_estimate':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_estimate':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_estimate':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_estimate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_sales_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_sales_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_sales_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_sales_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'void_sales_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_void_sales_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_sales_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_sales_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'void_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_void_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_credit_memo':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_credit_memo'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_credit_memo':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_credit_memo'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_credit_memo':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_credit_memo'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_refund_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_refund_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_refund_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_refund_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_refund_receipt':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_refund_receipt'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_bill':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_bill':
                $response = Hooks::apply(Config::withPrefix('quick_books_update_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_bill':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_bill_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_bill_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_bill_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_bill_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'void_bill_payment':
                $response = Hooks::apply(Config::withPrefix('quick_books_void_bill_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_expense':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_expense'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_expense':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_expense'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_purchase_order':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_purchase_order'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_purchase_order':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_purchase_order'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'send_purchase_order':
                $response = Hooks::apply(Config::withPrefix('quick_books_send_purchase_order'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_vendor_credit':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_vendor_credit'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_vendor_credit':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_vendor_credit'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_journal_entry':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_journal_entry'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_journal_entry':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_journal_entry'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_deposit':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_deposit'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_deposit':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_deposit'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_transfer':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_transfer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_transfer':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_transfer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_time_activity':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_time_activity'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_time_activity':
                $response = Hooks::apply(Config::withPrefix('quick_books_delete_time_activity'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_class':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_class'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_department':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_department'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_term':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_term'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_payment_method':
                $response = Hooks::apply(Config::withPrefix('quick_books_create_payment_method'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'upload_attachment':
                $response = Hooks::apply(Config::withPrefix('quick_books_upload_attachment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_note':
                $response = Hooks::apply(Config::withPrefix('quick_books_add_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('The action is not valid. Select a QuickBooks action.', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'QuickBooks', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $quickBooksField = $map->quickBooksField ?? '';

            if (empty($quickBooksField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$quickBooksField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$quickBooksField] = $fieldValues[$triggerField];
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
