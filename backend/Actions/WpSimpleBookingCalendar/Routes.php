<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpSimpleBookingCalendar\WpSimpleBookingCalendarController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_simple_booking_calendar_calendars', [WpSimpleBookingCalendarController::class, 'refreshCalendars']);
Route::post('refresh_wp_simple_booking_calendar_legend_items', [WpSimpleBookingCalendarController::class, 'refreshLegendItems']);
