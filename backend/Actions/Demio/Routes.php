<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Demio\DemioHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('demio_fetch_all_events', [DemioHelper::class, 'getAllEvents']);
Route::post('demio_fetch_all_sessions', [DemioHelper::class, 'getAllSessions']);
