<?php

/**
 * Dokan Integration
 */

namespace BitApps\Integrations\Actions\Dokan;

use WeDevs\DokanPro\Modules\Germanized\Helper;
use WP_Error;

/**
 * Provide functionality for Dokan integration
 */
class DokanController
{
    public static function checkedDokanExists()
    {
        if (!is_plugin_active('dokan-lite/dokan.php')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not active or not installed', 'bit-integrations'), 'Dokan'), 400);
        } else {
            return true;
        }
    }

    public function getAllVendors()
    {
        self::checkedDokanExists();

        $allVendors = dokan()->vendor->get_vendors(['number' => -1]);
        $vendorList = [];

        foreach ($allVendors as $vendor) {
            $dispalyName = $vendor->data->display_name;
            $vendorArray = $vendor->to_array();

            $vendorList[] = (object) [
                'label' => $dispalyName . ' (' . $vendorArray['store_name'] . ')',
                'value' => (string) $vendorArray['id']
            ];
        }

        wp_send_json_success($vendorList, 200);
    }

    public function getEUFields()
    {
        self::checkedDokanExists();

        $fields = [];
        $vendorEUFields = [
            ['key' => 'dokan_company_name', 'label' => __('Company Name', 'bit-integrations'), 'required' => false],
            ['key' => 'dokan_company_id_number', 'label' => __('Company ID/EUID Number', 'bit-integrations'), 'required' => false],
            ['key' => 'dokan_vat_number', 'label' => __('VAT/TAX Number', 'bit-integrations'), 'required' => false],
            ['key' => 'dokan_bank_name', 'label' => __('Name of Bank', 'bit-integrations'), 'required' => false],
            ['key' => 'dokan_bank_iban', 'label' => __('Bank IBAN', 'bit-integrations'), 'required' => false],
        ];

        if (is_plugin_active('dokan-pro/dokan-pro.php') && dokan_pro()->module->is_active('germanized')) {
            $enabledEUFields = Helper::is_fields_enabled_for_seller();

            foreach ($enabledEUFields as $key => $item) {
                if ($item) {
                    $vendorEnabledEUFieldsKey[] = $key;
                }
            }

            if (!empty($vendorEnabledEUFieldsKey)) {
                foreach ($vendorEUFields as $vendorEUField) {
                    if (\in_array($vendorEUField['key'], $vendorEnabledEUFieldsKey)) {
                        $fields[] = (object) $vendorEUField;
                    }
                }
            }

            wp_send_json_success($fields, 200);
        }

        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('EU Compliance Fields fetching failed - %s or EU Compliance Fields is not enabled', 'bit-integrations'), 'Dokan Pro'), 400);
    }

    public function execute($integrationData, $fieldValues)
    {
        self::checkedDokanExists();

        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $selectedTask = $integrationDetails->selectedTask;
        $selectedVendor = $integrationDetails->selectedVendor;
        $actions = (array) $integrationDetails->actions;
        $selectedPaymentMethod = $integrationDetails->selectedPaymentMethod;

        if (empty($fieldMap) || empty($selectedTask)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Fields map, task are required for Dokan', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integId);
        $dokanResponse = $recordApiHelper->execute($fieldValues, $fieldMap, $selectedTask, $actions, $selectedVendor, $selectedPaymentMethod);

        if (is_wp_error($dokanResponse)) {
            return $dokanResponse;
        }

        return $dokanResponse;
    }
}
