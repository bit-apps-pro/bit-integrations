<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpSimpleBookingCalendar\WpSimpleBookingCalendarHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_simple_booking_calendar_calendars', [WpSimpleBookingCalendarHelper::class, 'refreshCalendars']);
Route::post('refresh_wp_simple_booking_calendar_legend_items', [WpSimpleBookingCalendarHelper::class, 'refreshLegendItems']);
