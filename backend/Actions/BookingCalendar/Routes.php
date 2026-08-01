<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BookingCalendar\BookingCalendarController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_booking_calendar_bookings', [BookingCalendarController::class, 'refreshBookings']);
Route::post('refresh_booking_calendar_resources', [BookingCalendarController::class, 'refreshResources']);
