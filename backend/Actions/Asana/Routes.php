<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Asana\AsanaHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('asana_fetch_custom_fields', [AsanaHelper::class, 'getCustomFields']);
Route::post('asana_fetch_all_tasks', [AsanaHelper::class, 'getAllTasks']);
Route::post('asana_fetch_all_Projects', [AsanaHelper::class, 'getAllProjects']);
Route::post('asana_fetch_all_Sections', [AsanaHelper::class, 'getAllSections']);
