<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GoogleCalendar\GoogleCalendarHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('googleCalendar_get_all_lists', [GoogleCalendarHelper::class, 'getAllCalendarLists']);
