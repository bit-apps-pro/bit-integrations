<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LMFWC\LMFWCController;
use BitApps\Integrations\Core\Util\Route;

Route::post('lmfwc_fetch_all_customer', [LMFWCController::class, 'getAllCustomer']);
Route::post('lmfwc_fetch_all_product', [LMFWCController::class, 'getAllProduct']);
Route::post('lmfwc_fetch_all_order', [LMFWCController::class, 'getAllOrder']);
Route::post('lmfwc_fetch_all_license', [LMFWCController::class, 'getAllLicense']);
Route::post('lmfwc_fetch_all_generator', [LMFWCController::class, 'getAllGenerator']);
