<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MotoPressHotelBooking\MotoPressHotelBookingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_motopress_hotel_booking_accommodation_types', [MotoPressHotelBookingController::class, 'refreshAccommodationTypes']);
Route::post('refresh_motopress_hotel_booking_accommodations', [MotoPressHotelBookingController::class, 'refreshAccommodations']);
Route::post('refresh_motopress_hotel_booking_rates', [MotoPressHotelBookingController::class, 'refreshRates']);
Route::post('refresh_motopress_hotel_booking_countries', [MotoPressHotelBookingController::class, 'refreshCountries']);
Route::post('refresh_motopress_hotel_booking_gateways', [MotoPressHotelBookingController::class, 'refreshGateways']);
Route::post('refresh_motopress_hotel_booking_note_authors', [MotoPressHotelBookingController::class, 'refreshNoteAuthors']);
