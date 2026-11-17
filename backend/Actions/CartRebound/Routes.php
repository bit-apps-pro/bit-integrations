<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CartRebound\CartReboundController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_cart_rebound_templates', [CartReboundController::class, 'refreshTemplates']);
Route::post('refresh_cart_rebound_coupons', [CartReboundController::class, 'refreshCoupons']);
Route::post('refresh_cart_rebound_order_statuses', [CartReboundController::class, 'refreshOrderStatuses']);
