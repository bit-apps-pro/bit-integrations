<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ModernCart\ModernCartHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_modern_cart_products', [ModernCartHelper::class, 'refreshProducts']);
Route::post('refresh_modern_cart_product_variations', [ModernCartHelper::class, 'refreshProductVariations']);
Route::post('refresh_modern_cart_cart_items', [ModernCartHelper::class, 'refreshCartItems']);
