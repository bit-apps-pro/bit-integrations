<?php

if (!defined('ABSPATH')) {
    exit;
}
use BitApps\Integrations\Core\Util\Route;
use BitApps\Integrations\Triggers\WC\WCController;

Route::get('wc/get', [WCController::class, 'getAll']);
Route::post('wc/get/form', [WCController::class, 'get_trigger_field']);

Route::get('get_all_order_status', [WCController::class, 'getOrderStatus']);
Route::get('get_all_woocommerce_product', [WCController::class, 'getWooCommerceProduct']);
Route::get('get_all_product_category', [WCController::class, 'getProductCategories']);
Route::get('get_all_variation_by_product', [WCController::class, 'getVariationOfProduct']);
