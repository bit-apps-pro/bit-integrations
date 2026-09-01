<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\RoxAppointmentBooking\RoxAppointmentBookingController;
use BitApps\Integrations\Core\Util\Route;

Route::post('rox_appointment_booking_authorize', [RoxAppointmentBookingController::class, 'roxAppointmentBookingAuthorize']);
Route::post('refresh_rox_appointment_booking_services', [RoxAppointmentBookingController::class, 'refreshServices']);
Route::post('refresh_rox_appointment_booking_agents', [RoxAppointmentBookingController::class, 'refreshAgents']);
Route::post('refresh_rox_appointment_booking_categories', [RoxAppointmentBookingController::class, 'refreshCategories']);
Route::post('refresh_rox_appointment_booking_locations', [RoxAppointmentBookingController::class, 'refreshLocations']);
