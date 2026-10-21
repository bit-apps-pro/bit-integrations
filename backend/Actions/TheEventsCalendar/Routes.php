<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TheEventsCalendar\TheEventsCalendarController;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_the_events_calendar_events', [TheEventsCalendarController::class, 'getAllEvents']);
Route::post('refresh_the_events_calendar_events', [TheEventsCalendarController::class, 'refreshEvents']);
Route::post('refresh_the_events_calendar_venues', [TheEventsCalendarController::class, 'refreshVenues']);
Route::post('refresh_the_events_calendar_organizers', [TheEventsCalendarController::class, 'refreshOrganizers']);
Route::post('refresh_the_events_calendar_categories', [TheEventsCalendarController::class, 'refreshCategories']);
Route::post('refresh_the_events_calendar_series', [TheEventsCalendarController::class, 'refreshSeries']);
Route::post('refresh_the_events_calendar_timezones', [TheEventsCalendarController::class, 'refreshTimezones']);
