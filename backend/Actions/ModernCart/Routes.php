<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ModernCart\ModernCartController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_modern_cart_products', [ModernCartController::class, 'refreshProducts']);
Route::post('refresh_modern_cart_product_variations', [ModernCartController::class, 'refreshProductVariations']);
Route::post('refresh_modern_cart_cart_items', [ModernCartController::class, 'refreshCartItems']);
