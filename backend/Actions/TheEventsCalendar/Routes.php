<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TheEventsCalendar\TheEventsCalendarController;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_the_events_calendar_events', [TheEventsCalendarController::class, 'getAllEvents']);
