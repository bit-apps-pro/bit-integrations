<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Flodesk\FlodeskHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('flodesk_get_segments', [FlodeskHelper::class, 'getSegments']);
Route::post('flodesk_get_workflows', [FlodeskHelper::class, 'getWorkflows']);
Route::post('flodesk_get_custom_fields', [FlodeskHelper::class, 'getCustomFields']);
Route::post('flodesk_get_segment_colors', [FlodeskHelper::class, 'getSegmentColors']);
