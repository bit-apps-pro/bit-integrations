<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PowerCoupons\PowerCouponsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('power_coupons_authorize', [PowerCouponsController::class, 'powerCouponsAuthorize']);
