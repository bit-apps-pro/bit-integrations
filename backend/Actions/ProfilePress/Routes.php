<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ProfilePress\ProfilePressHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_profilepress_plans', [ProfilePressHelper::class, 'refreshPlans']);
