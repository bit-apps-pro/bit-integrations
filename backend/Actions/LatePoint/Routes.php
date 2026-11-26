<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LatePoint\LatePointHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_latepoint_agents', [LatePointHelper::class, 'refreshAgents']);
Route::post('refresh_latepoint_services', [LatePointHelper::class, 'refreshServices']);
Route::post('refresh_latepoint_locations', [LatePointHelper::class, 'refreshLocations']);
Route::post('refresh_latepoint_bundles', [LatePointHelper::class, 'refreshBundles']);
