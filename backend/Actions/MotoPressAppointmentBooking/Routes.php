<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MotoPressAppointmentBooking\MotoPressAppointmentBookingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_motopress_appointment_booking_services', [MotoPressAppointmentBookingController::class, 'refreshServices']);
Route::post('refresh_motopress_appointment_booking_employees', [MotoPressAppointmentBookingController::class, 'refreshEmployees']);
Route::post('refresh_motopress_appointment_booking_locations', [MotoPressAppointmentBookingController::class, 'refreshLocations']);
Route::post('refresh_motopress_appointment_booking_gateways', [MotoPressAppointmentBookingController::class, 'refreshGateways']);
Route::post('refresh_motopress_appointment_booking_currencies', [MotoPressAppointmentBookingController::class, 'refreshCurrencies']);
Route::post('refresh_motopress_appointment_booking_users', [MotoPressAppointmentBookingController::class, 'refreshUsers']);
