<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Livestorm\LivestormHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('livestorm_fetch_all_events', [LivestormHelper::class, 'getAllEvents']);
Route::post('livestorm_fetch_all_sessions', [LivestormHelper::class, 'getAllSessions']);
