<?php

namespace BitApps\Integrations\Actions\Xero;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Http\ApiClient;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private const SETTING_KEYS = [
        'account_type',
        'add_to_watchlist',
        'approved_for_sending',
        'bank_account_id',
        'bank_account_type',
        'branding_theme_id',
        'cogs_account_code',
        'contact_id',
        'credit_account_code',
        'credit_note_type',
        'currency_code',
        'debit_account_code',
        'due_date_type',
        'enable_payments',
        'from_bank_account_id',
        'from_is_reconciled',
        'include_online',
        'include_pdf',
        'inventory_asset_account_code',
        'invoice_type',
        'is_compound',
        'is_non_recoverable',
        'is_purchased',
        'is_reconciled',
        'is_sold',
        'line_account_code',
        'line_amount_types',
        'line_item_code',
        'line_tax_type',
        'mark_as_sent',
        'purchase_account_code',
        'purchase_tax_type',
        'purchases_tax_type',
        'record_type',
        'report_tax_type',
        'sales_account_code',
        'sales_tax_type',
        'send_copy',
        'sent_to_contact',
        'show_in_expense_claims',
        'show_on_cash_basis_reports',
        'status',
        'target_type',
        'tax_type',
        'to_bank_account_id',
        'to_is_reconciled',
        'transaction_type',
        'unit',
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
            case 'create_contact':
                $response = Hooks::apply(Config::withPrefix('xero_create_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_contact':
                $response = Hooks::apply(Config::withPrefix('xero_update_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_or_update_contact':
                $response = Hooks::apply(Config::withPrefix('xero_create_or_update_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'archive_contact':
                $response = Hooks::apply(Config::withPrefix('xero_archive_contact'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_contact_group':
                $response = Hooks::apply(Config::withPrefix('xero_create_contact_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'rename_contact_group':
                $response = Hooks::apply(Config::withPrefix('xero_rename_contact_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_contact_group':
                $response = Hooks::apply(Config::withPrefix('xero_delete_contact_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_contacts_to_group':
                $response = Hooks::apply(Config::withPrefix('xero_add_contacts_to_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_contact_from_group':
                $response = Hooks::apply(Config::withPrefix('xero_remove_contact_from_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'remove_all_contacts_from_group':
                $response = Hooks::apply(Config::withPrefix('xero_remove_all_contacts_from_group'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_create_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_bill':
                $response = Hooks::apply(Config::withPrefix('xero_create_bill'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_update_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'approve_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_approve_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'void_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_void_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_delete_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'email_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_email_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_credit_note':
                $response = Hooks::apply(Config::withPrefix('xero_create_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_credit_note':
                $response = Hooks::apply(Config::withPrefix('xero_update_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'approve_credit_note':
                $response = Hooks::apply(Config::withPrefix('xero_approve_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'void_credit_note':
                $response = Hooks::apply(Config::withPrefix('xero_void_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_credit_note':
                $response = Hooks::apply(Config::withPrefix('xero_delete_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'allocate_credit_note':
                $response = Hooks::apply(Config::withPrefix('xero_allocate_credit_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_credit_note_allocation':
                $response = Hooks::apply(Config::withPrefix('xero_delete_credit_note_allocation'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_quote':
                $response = Hooks::apply(Config::withPrefix('xero_create_quote'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_quote':
                $response = Hooks::apply(Config::withPrefix('xero_update_quote'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_quote_status':
                $response = Hooks::apply(Config::withPrefix('xero_update_quote_status'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_purchase_order':
                $response = Hooks::apply(Config::withPrefix('xero_create_purchase_order'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_purchase_order':
                $response = Hooks::apply(Config::withPrefix('xero_update_purchase_order'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_purchase_order_status':
                $response = Hooks::apply(Config::withPrefix('xero_update_purchase_order_status'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_repeating_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_create_repeating_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_repeating_invoice':
                $response = Hooks::apply(Config::withPrefix('xero_delete_repeating_invoice'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_item':
                $response = Hooks::apply(Config::withPrefix('xero_create_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_item':
                $response = Hooks::apply(Config::withPrefix('xero_update_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_item':
                $response = Hooks::apply(Config::withPrefix('xero_delete_item'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_linked_transaction':
                $response = Hooks::apply(Config::withPrefix('xero_create_linked_transaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_linked_transaction':
                $response = Hooks::apply(Config::withPrefix('xero_update_linked_transaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_linked_transaction':
                $response = Hooks::apply(Config::withPrefix('xero_delete_linked_transaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_payment':
                $response = Hooks::apply(Config::withPrefix('xero_create_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_payment':
                $response = Hooks::apply(Config::withPrefix('xero_delete_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_batch_payment':
                $response = Hooks::apply(Config::withPrefix('xero_create_batch_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_batch_payment':
                $response = Hooks::apply(Config::withPrefix('xero_delete_batch_payment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'allocate_overpayment':
                $response = Hooks::apply(Config::withPrefix('xero_allocate_overpayment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_overpayment_allocation':
                $response = Hooks::apply(Config::withPrefix('xero_delete_overpayment_allocation'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'allocate_prepayment':
                $response = Hooks::apply(Config::withPrefix('xero_allocate_prepayment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_prepayment_allocation':
                $response = Hooks::apply(Config::withPrefix('xero_delete_prepayment_allocation'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_spend_money':
                $response = Hooks::apply(Config::withPrefix('xero_create_spend_money'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_receive_money':
                $response = Hooks::apply(Config::withPrefix('xero_create_receive_money'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_bank_transaction':
                $response = Hooks::apply(Config::withPrefix('xero_update_bank_transaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_bank_transaction':
                $response = Hooks::apply(Config::withPrefix('xero_delete_bank_transaction'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_bank_transfer':
                $response = Hooks::apply(Config::withPrefix('xero_create_bank_transfer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_bank_transfer':
                $response = Hooks::apply(Config::withPrefix('xero_delete_bank_transfer'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_manual_journal':
                $response = Hooks::apply(Config::withPrefix('xero_create_manual_journal'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_manual_journal':
                $response = Hooks::apply(Config::withPrefix('xero_update_manual_journal'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_manual_journal_status':
                $response = Hooks::apply(Config::withPrefix('xero_update_manual_journal_status'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_account':
                $response = Hooks::apply(Config::withPrefix('xero_create_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_account':
                $response = Hooks::apply(Config::withPrefix('xero_update_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'archive_account':
                $response = Hooks::apply(Config::withPrefix('xero_archive_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_account':
                $response = Hooks::apply(Config::withPrefix('xero_delete_account'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_tracking_category':
                $response = Hooks::apply(Config::withPrefix('xero_create_tracking_category'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_tracking_category':
                $response = Hooks::apply(Config::withPrefix('xero_update_tracking_category'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_tracking_category':
                $response = Hooks::apply(Config::withPrefix('xero_delete_tracking_category'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_tracking_option':
                $response = Hooks::apply(Config::withPrefix('xero_create_tracking_option'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_tracking_option':
                $response = Hooks::apply(Config::withPrefix('xero_update_tracking_option'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'delete_tracking_option':
                $response = Hooks::apply(Config::withPrefix('xero_delete_tracking_option'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'create_tax_rate':
                $response = Hooks::apply(Config::withPrefix('xero_create_tax_rate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'update_tax_rate':
                $response = Hooks::apply(Config::withPrefix('xero_update_tax_rate'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_currency':
                $response = Hooks::apply(Config::withPrefix('xero_add_currency'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'add_note':
                $response = Hooks::apply(Config::withPrefix('xero_add_note'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'upload_attachment':
                $response = Hooks::apply(Config::withPrefix('xero_upload_attachment'), $default, $fieldData, $this->apiClient, $settings);

                break;

            case 'download_pdf':
                $response = Hooks::apply(Config::withPrefix('xero_download_pdf'), $default, $fieldData, $this->apiClient, $settings);

                break;

            default:
                $response = ['success' => false, 'message' => __('The action is not valid. Select a Xero action.', 'bit-integrations'), 'code' => 400];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'Xero', 'type_name' => $mainAction], $responseType, wp_json_encode($response));

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldValues, $fieldMap)
    {
        $data = [];

        foreach ((array) $fieldMap as $map) {
            $triggerField = $map->formField ?? '';
            $xeroField = $map->xeroField ?? '';

            if (empty($xeroField)) {
                continue;
            }

            if ($triggerField === 'custom') {
                $data[$xeroField] = Common::replaceFieldWithValue($map->customValue ?? '', $fieldValues);
            } elseif (isset($fieldValues[$triggerField])) {
                $data[$xeroField] = $fieldValues[$triggerField];
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
