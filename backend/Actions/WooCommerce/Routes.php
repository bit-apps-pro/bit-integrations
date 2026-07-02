<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WooCommerce\WooCommerceController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wc_refresh_fields', [WooCommerceController::class, 'refreshFields']);
Route::post('wc_search_products', [WooCommerceController::class, 'searchProjects']);
Route::post('wc_get_all_subscriptions_products', [WooCommerceController::class, 'allSubscriptionsProducts']);
