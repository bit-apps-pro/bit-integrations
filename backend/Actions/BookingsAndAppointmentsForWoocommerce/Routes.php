<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BookingsAndAppointmentsForWoocommerce\BookingsAndAppointmentsForWoocommerceHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('bookings_and_appointments_for_woocommerce_authorize', [BookingsAndAppointmentsForWoocommerceHelper::class, 'bookingsAndAppointmentsForWoocommerceAuthorize']);
Route::post('refresh_bookings_and_appointments_for_woocommerce_products', [BookingsAndAppointmentsForWoocommerceHelper::class, 'refreshProducts']);
Route::post('refresh_bookings_and_appointments_for_woocommerce_customers', [BookingsAndAppointmentsForWoocommerceHelper::class, 'refreshCustomers']);
Route::post('refresh_bookings_and_appointments_for_woocommerce_assets', [BookingsAndAppointmentsForWoocommerceHelper::class, 'refreshAssets']);
