<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Asana\AsanaController;
use BitApps\Integrations\Core\Util\Route;

Route::post('asana_fetch_custom_fields', [AsanaController::class, 'getCustomFields']);
Route::post('asana_fetch_all_tasks', [AsanaController::class, 'getAllTasks']);
Route::post('asana_fetch_all_Projects', [AsanaController::class, 'getAllProjects']);
Route::post('asana_fetch_all_Sections', [AsanaController::class, 'getAllSections']);
