<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SureDash\SureDashController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sure_dash_authorize', [SureDashController::class, 'sureDashAuthorize']);
Route::post('refresh_sure_dash_spaces', [SureDashController::class, 'refreshSpaces']);
Route::post('refresh_sure_dash_posts', [SureDashController::class, 'refreshPosts']);
