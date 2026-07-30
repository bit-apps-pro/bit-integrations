<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Demio\DemioController;
use BitApps\Integrations\Core\Util\Route;

Route::post('demio_fetch_all_events', [DemioController::class, 'getAllEvents']);
Route::post('demio_fetch_all_sessions', [DemioController::class, 'getAllSessions']);
