<?php

namespace BitApps\Integrations\Actions\BookingsAndAppointmentsForWoocommerce;

use WP_Error;

class BookingsAndAppointmentsForWoocommerceController
{
    public static function isExists()
    {
        if (!\defined('PH_BOOKINGS_PLUGIN_FILE')) {
            wp_send_json_error(__('Bookings and Appointments for WooCommerce is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function bookingsAndAppointmentsForWoocommerceAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshProducts()
    {
        self::isExists();

        $products = [];

        if (\function_exists('wc_get_products')) {
            foreach (wc_get_products(['type' => 'phive_booking', 'limit' => -1]) as $product) {
                $products[] = ['id' => $product->get_id(), 'title' => $product->get_name()];
            }
        }

        wp_send_json_success(['products' => $products]);
    }

    public static function refreshCustomers()
    {
        self::isExists();

        $customers = array_map(
            static fn ($user) => ['id' => $user->ID, 'title' => $user->display_name . ' (' . $user->user_email . ')'],
            get_users(['fields' => ['ID', 'display_name', 'user_email']])
        );

        wp_send_json_success(['customers' => $customers]);
    }

    public static function refreshAssets()
    {
        self::isExists();

        $assetSettings = get_option('ph_booking_settings_assets', []);
        $rules = (array) ($assetSettings['_phive_booking_assets'] ?? []);

        $assets = array_map(
            static fn ($assetId, $rule) => ['id' => $assetId, 'title' => $rule['ph_booking_asset_name'] ?? ('Asset #' . $assetId)],
            array_keys($rules),
            $rules
        );

        wp_send_json_success(['assets' => $assets]);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integDetails = $integrationData->flow_details;
        $integId      = $integrationData->id;
        $fieldMap     = $integDetails->field_map;
        $utilities    = $integDetails->utilities ?? [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        return (new RecordApiHelper($integDetails, $integId))->execute($fieldValues, $fieldMap, $utilities);
    }
}
