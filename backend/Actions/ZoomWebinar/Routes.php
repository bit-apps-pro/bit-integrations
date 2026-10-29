<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZoomWebinar\ZoomWebinarHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zoom_webinar_fetch_all_webinar', [ZoomWebinarHelper::class, 'zoomFetchAllWebinar']);
