<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WebbaBooking\WebbaBookingHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_webba_booking_services', [WebbaBookingHelper::class, 'refreshServices']);
Route::post('refresh_webba_booking_staff', [WebbaBookingHelper::class, 'refreshStaff']);
Route::post('refresh_webba_booking_categories', [WebbaBookingHelper::class, 'refreshCategories']);
Route::post('refresh_webba_booking_locations', [WebbaBookingHelper::class, 'refreshLocations']);
Route::post('refresh_webba_booking_statuses', [WebbaBookingHelper::class, 'refreshStatuses']);
Route::post('refresh_webba_booking_bookings', [WebbaBookingHelper::class, 'refreshBookings']);
Route::post('refresh_webba_booking_coupons', [WebbaBookingHelper::class, 'refreshCoupons']);
