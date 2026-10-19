<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Flodesk\FlodeskController;
use BitApps\Integrations\Core\Util\Route;

Route::post('flodesk_get_segments', [FlodeskController::class, 'getSegments']);
Route::post('flodesk_get_workflows', [FlodeskController::class, 'getWorkflows']);
Route::post('flodesk_get_custom_fields', [FlodeskController::class, 'getCustomFields']);
Route::post('flodesk_get_segment_colors', [FlodeskController::class, 'getSegmentColors']);
