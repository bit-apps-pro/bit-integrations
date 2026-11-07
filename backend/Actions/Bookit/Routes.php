<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Bookit\BookitController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_bookit_services', [BookitController::class, 'refreshServices']);
Route::post('refresh_bookit_staff', [BookitController::class, 'refreshStaff']);
Route::post('refresh_bookit_customers', [BookitController::class, 'refreshCustomers']);
Route::post('refresh_bookit_categories', [BookitController::class, 'refreshCategories']);
Route::post('refresh_bookit_payment_methods', [BookitController::class, 'refreshPaymentMethods']);
Route::post('refresh_bookit_wp_users', [BookitController::class, 'refreshWpUsers']);
Route::post('refresh_bookit_staff_wp_users', [BookitController::class, 'refreshStaffWpUsers']);
