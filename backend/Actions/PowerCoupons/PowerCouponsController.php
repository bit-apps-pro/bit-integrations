<?php

/**
 * Power Coupons Integration
 */

namespace BitApps\Integrations\Actions\PowerCoupons;

use WP_Error;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Provide functionality for Power Coupons action integration.
 */
class PowerCouponsController
{
    public static function isExists()
    {
        if (!self::isPluginInstalled()) {
            wp_send_json_error(
                __(
                    'Power Coupons for WooCommerce is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function powerCouponsAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public static function refreshCoupons()
    {
        self::isExists();

        $coupons = [];
        $couponPosts = get_posts(
            [
                'post_type'      => 'shop_coupon',
                'post_status'    => ['publish', 'draft', 'pending', 'private'],
                'posts_per_page' => -1,
                'orderby'        => 'date',
                'order'          => 'DESC',
                'fields'         => 'ids',
            ]
        );

        foreach ($couponPosts as $couponId) {
            try {
                $coupon = new \WC_Coupon((int) $couponId);
                $code = $coupon->get_code();
            } catch (\Throwable $th) {
                continue;
            }

            if ($code === '') {
                continue;
            }

            $coupons[] = (object) [
                'value' => (int) $couponId,
                'label' => '#' . (int) $couponId . ' - ' . $code,
            ];
        }

        wp_send_json_success(['coupons' => $coupons], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $powerCouponsResponse = $recordApiHelper->execute($fieldValues, $fieldMap);

        if (is_wp_error($powerCouponsResponse)) {
            return $powerCouponsResponse;
        }

        return $powerCouponsResponse;
    }

    public static function isPluginInstalled()
    {
        return (class_exists('\WooCommerce') || function_exists('WC'))
            && (
                defined('POWER_COUPONS_VERSION')
                || function_exists('power_coupons')
                || class_exists('\Power_Coupons\Power_Coupons_Loader')
            );
    }
}
