<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Zoom\ZoomHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zoom_fetch_all_meetings', [ZoomHelper::class, 'zoomFetchAllMeetings']);
Route::post('zoom_fetch_all_fields', [ZoomHelper::class, 'zoomFetchAllCustomFields']);
