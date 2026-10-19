<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Memberpress\MemberpressHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_membership', [MemberpressHelper::class, 'getAllMembership']);
Route::post('fetch_all_payment_gateway', [MemberpressHelper::class, 'allPaymentGateway']);
