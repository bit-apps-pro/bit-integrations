<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Memberpress\MemberpressController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_membership', [MemberpressController::class, 'getAllMembership']);
Route::post('fetch_all_payment_gateway', [MemberpressController::class, 'allPaymentGateway']);
