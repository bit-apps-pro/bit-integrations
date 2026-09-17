<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BookingsAndAppointmentsForWoocommerce\BookingsAndAppointmentsForWoocommerceController;
use BitApps\Integrations\Core\Util\Route;

Route::post('bookings_and_appointments_for_woocommerce_authorize', [BookingsAndAppointmentsForWoocommerceController::class, 'bookingsAndAppointmentsForWoocommerceAuthorize']);
Route::post('refresh_bookings_and_appointments_for_woocommerce_products', [BookingsAndAppointmentsForWoocommerceController::class, 'refreshProducts']);
Route::post('refresh_bookings_and_appointments_for_woocommerce_customers', [BookingsAndAppointmentsForWoocommerceController::class, 'refreshCustomers']);
Route::post('refresh_bookings_and_appointments_for_woocommerce_assets', [BookingsAndAppointmentsForWoocommerceController::class, 'refreshAssets']);
