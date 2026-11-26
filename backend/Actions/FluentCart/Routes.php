<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FluentCart\FluentCartHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_fluent_cart_products', [FluentCartHelper::class, 'refreshProducts']);
Route::post('refresh_fluent_cart_products_categories', [FluentCartHelper::class, 'refreshProductCategories']);
Route::post('refresh_fluent_cart_customers', [FluentCartHelper::class, 'refreshCustomers']);
Route::post('refresh_fluent_cart_product_brands', [FluentCartHelper::class, 'refreshProductBrands']);
Route::post('refresh_fluent_cart_product_shipping_classes', [FluentCartHelper::class, 'refreshProductShippingClasses']);
Route::post('refresh_fluent_cart_order_statuses', [FluentCartHelper::class, 'refreshOrderStatuses']);
