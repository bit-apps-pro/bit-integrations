<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CartAbandonmentRecovery\CartAbandonmentRecoveryController;
use BitApps\Integrations\Core\Util\Route;

Route::post('cart_abandonment_recovery_authorize', [CartAbandonmentRecoveryController::class, 'cartAbandonmentRecoveryAuthorize']);
Route::post('refresh_cart_abandonment_recovery_carts', [CartAbandonmentRecoveryController::class, 'refreshCarts']);
