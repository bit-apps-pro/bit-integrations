<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpHotelBooking\WpHotelBookingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_hotel_booking_rooms', [WpHotelBookingController::class, 'refreshRooms']);
Route::post('refresh_wp_hotel_booking_coupons', [WpHotelBookingController::class, 'refreshCoupons']);
Route::post('refresh_wp_hotel_booking_extras', [WpHotelBookingController::class, 'refreshExtras']);
Route::post('refresh_wp_hotel_booking_room_types', [WpHotelBookingController::class, 'refreshRoomTypes']);
Route::post('refresh_wp_hotel_booking_payment_methods', [WpHotelBookingController::class, 'refreshPaymentMethods']);
