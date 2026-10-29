<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CartAbandonmentRecovery\CartAbandonmentRecoveryHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_cart_abandonment_recovery_carts', [CartAbandonmentRecoveryHelper::class, 'refreshCarts']);
