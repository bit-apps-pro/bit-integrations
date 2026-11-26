<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BookingCalendar\BookingCalendarHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_booking_calendar_bookings', [BookingCalendarHelper::class, 'refreshBookings']);
Route::post('refresh_booking_calendar_resources', [BookingCalendarHelper::class, 'refreshResources']);
