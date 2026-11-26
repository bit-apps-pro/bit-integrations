<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LMFWC\LMFWCHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('lmfwc_fetch_all_customer', [LMFWCHelper::class, 'getAllCustomer']);
Route::post('lmfwc_fetch_all_product', [LMFWCHelper::class, 'getAllProduct']);
Route::post('lmfwc_fetch_all_order', [LMFWCHelper::class, 'getAllOrder']);
Route::post('lmfwc_fetch_all_license', [LMFWCHelper::class, 'getAllLicense']);
Route::post('lmfwc_fetch_all_generator', [LMFWCHelper::class, 'getAllGenerator']);
