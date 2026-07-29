<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Livestorm\LivestormController;
use BitApps\Integrations\Core\Util\Route;

Route::post('livestorm_fetch_all_events', [LivestormController::class, 'getAllEvents']);
Route::post('livestorm_fetch_all_sessions', [LivestormController::class, 'getAllSessions']);
