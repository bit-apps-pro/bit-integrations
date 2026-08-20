<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ProfilePress\ProfilePressController;
use BitApps\Integrations\Core\Util\Route;

Route::post('profilepress_authorize', [ProfilePressController::class, 'profilePressAuthorize']);
Route::post('refresh_profilepress_plans', [ProfilePressController::class, 'refreshPlans']);
