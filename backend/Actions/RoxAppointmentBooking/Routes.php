<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\RoxAppointmentBooking\RoxAppointmentBookingHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('rox_appointment_booking_authorize', [RoxAppointmentBookingHelper::class, 'roxAppointmentBookingAuthorize']);
Route::post('refresh_rox_appointment_booking_services', [RoxAppointmentBookingHelper::class, 'refreshServices']);
Route::post('refresh_rox_appointment_booking_agents', [RoxAppointmentBookingHelper::class, 'refreshAgents']);
Route::post('refresh_rox_appointment_booking_categories', [RoxAppointmentBookingHelper::class, 'refreshCategories']);
Route::post('refresh_rox_appointment_booking_locations', [RoxAppointmentBookingHelper::class, 'refreshLocations']);
