<?php

namespace BitApps\Integrations\Actions\PowerCoupons;

if (!defined('ABSPATH')) {
    exit;
}

class PowerCouponsHelper
{
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
