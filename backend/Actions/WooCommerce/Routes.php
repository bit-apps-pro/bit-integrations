<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WooCommerce\WooCommerceHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('wc_refresh_fields', [WooCommerceHelper::class, 'refreshFields']);
Route::post('wc_get_all_subscriptions_products', [WooCommerceHelper::class, 'allSubscriptionsProducts']);
