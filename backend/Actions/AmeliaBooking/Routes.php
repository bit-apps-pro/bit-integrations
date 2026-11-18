<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\AmeliaBooking\AmeliaBookingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_amelia_booking_services', [AmeliaBookingController::class, 'refreshServices']);
Route::post('refresh_amelia_booking_employees', [AmeliaBookingController::class, 'refreshEmployees']);
Route::post('refresh_amelia_booking_locations', [AmeliaBookingController::class, 'refreshLocations']);
Route::post('refresh_amelia_booking_categories', [AmeliaBookingController::class, 'refreshCategories']);
Route::post('refresh_amelia_booking_events', [AmeliaBookingController::class, 'refreshEvents']);
