<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TheEventsCalendar\TheEventsCalendarHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_the_events_calendar_events', [TheEventsCalendarHelper::class, 'getAllEvents']);
Route::post('refresh_the_events_calendar_events', [TheEventsCalendarHelper::class, 'refreshEvents']);
Route::post('refresh_the_events_calendar_venues', [TheEventsCalendarHelper::class, 'refreshVenues']);
Route::post('refresh_the_events_calendar_organizers', [TheEventsCalendarHelper::class, 'refreshOrganizers']);
Route::post('refresh_the_events_calendar_categories', [TheEventsCalendarHelper::class, 'refreshCategories']);
Route::post('refresh_the_events_calendar_series', [TheEventsCalendarHelper::class, 'refreshSeries']);
Route::post('refresh_the_events_calendar_timezones', [TheEventsCalendarHelper::class, 'refreshTimezones']);
Route::post('refresh_the_events_calendar_custom_fields', [TheEventsCalendarHelper::class, 'refreshCustomFields']);
