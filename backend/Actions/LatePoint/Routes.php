<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LatePoint\LatePointController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_latepoint_agents', [LatePointController::class, 'refreshAgents']);
Route::post('refresh_latepoint_services', [LatePointController::class, 'refreshServices']);
Route::post('refresh_latepoint_locations', [LatePointController::class, 'refreshLocations']);
Route::post('refresh_latepoint_bundles', [LatePointController::class, 'refreshBundles']);
