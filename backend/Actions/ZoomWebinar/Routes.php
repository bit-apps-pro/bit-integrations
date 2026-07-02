<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZoomWebinar\ZoomWebinarController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zoom_webinar_fetch_all_webinar', [ZoomWebinarController::class, 'zoomFetchAllWebinar']);
