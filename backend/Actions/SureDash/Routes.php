<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SureDash\SureDashHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_sure_dash_spaces', [SureDashHelper::class, 'refreshSpaces']);
Route::post('refresh_sure_dash_posts', [SureDashHelper::class, 'refreshPosts']);
