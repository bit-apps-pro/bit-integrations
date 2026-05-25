<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Zoom\ZoomController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zoom_fetch_all_meetings', [ZoomController::class, 'zoomFetchAllMeetings']);
Route::post('zoom_fetch_all_fields', [ZoomController::class, 'zoomFetchAllCustomFields']);
