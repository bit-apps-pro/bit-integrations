<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WebbaBooking\WebbaBookingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('webba_booking_authorize', [WebbaBookingController::class, 'webbaBookingAuthorize']);
Route::post('refresh_webba_booking_services', [WebbaBookingController::class, 'refreshServices']);
Route::post('refresh_webba_booking_staff', [WebbaBookingController::class, 'refreshStaff']);
Route::post('refresh_webba_booking_categories', [WebbaBookingController::class, 'refreshCategories']);
Route::post('refresh_webba_booking_locations', [WebbaBookingController::class, 'refreshLocations']);
Route::post('refresh_webba_booking_statuses', [WebbaBookingController::class, 'refreshStatuses']);
Route::post('refresh_webba_booking_bookings', [WebbaBookingController::class, 'refreshBookings']);
Route::post('refresh_webba_booking_coupons', [WebbaBookingController::class, 'refreshCoupons']);
