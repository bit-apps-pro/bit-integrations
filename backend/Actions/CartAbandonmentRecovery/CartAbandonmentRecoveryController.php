<?php

namespace BitApps\Integrations\Actions\CartAbandonmentRecovery;

class CartAbandonmentRecoveryController
{
    public static function isExists()
    {
        if (!\defined('CARTFLOWS_CA_FILE')) {
            wp_send_json_error(__('Cart Abandonment Recovery is not activated or not installed', 'bit-integrations'), 400);
        }
    }

    public static function cartAbandonmentRecoveryAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshCarts()
    {
        self::isExists();

        wp_send_json_success(['carts' => self::getAbandonedCarts()], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map ?? [];

        return (new RecordApiHelper($integrationDetails, $integId))->execute($fieldValues, $fieldMap);
    }

    private static function getAbandonedCarts()
    {
        if (!\defined('CARTFLOWS_CA_CART_ABANDONMENT_TABLE')) {
            return [];
        }

        global $wpdb;
        $tableName = $wpdb->prefix . CARTFLOWS_CA_CART_ABANDONMENT_TABLE;

        $carts = $wpdb->get_results(
            // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery
            $wpdb->prepare(
                // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table name is sourced from the WCAR plugin constant.
                "SELECT session_id, email, cart_total, order_status, time FROM {$tableName} WHERE order_status = %s ORDER BY time DESC",
                'abandoned'
            )
        );

        $currencySymbol = \function_exists('get_woocommerce_currency_symbol')
            ? html_entity_decode(get_woocommerce_currency_symbol())
            : '';

        return array_map(
            static function ($cart) use ($currencySymbol) {
                $email = $cart->email ?: __('Unknown customer', 'bit-integrations');
                $label = $email . ' (' . $cart->cart_total . ' ' . $currencySymbol . ')';

                return (object) [
                    'value' => $cart->session_id,
                    'label' => $label,
                ];
            },
            $carts ?: []
        );
    }

}
