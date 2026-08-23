<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ProfilePress\ProfilePressController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_profilepress_plans', [ProfilePressController::class, 'refreshPlans']);
