<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpHotelBooking\WpHotelBookingHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_hotel_booking_rooms', [WpHotelBookingHelper::class, 'refreshRooms']);
Route::post('refresh_wp_hotel_booking_coupons', [WpHotelBookingHelper::class, 'refreshCoupons']);
Route::post('refresh_wp_hotel_booking_extras', [WpHotelBookingHelper::class, 'refreshExtras']);
Route::post('refresh_wp_hotel_booking_room_types', [WpHotelBookingHelper::class, 'refreshRoomTypes']);
Route::post('refresh_wp_hotel_booking_payment_methods', [WpHotelBookingHelper::class, 'refreshPaymentMethods']);
