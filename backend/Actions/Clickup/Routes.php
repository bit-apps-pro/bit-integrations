<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Clickup\ClickupController;
use BitApps\Integrations\Core\Util\Route;

Route::post('clickup_fetch_custom_fields', [ClickupController::class, 'getCustomFields']);
Route::post('clickup_fetch_all_tasks', [ClickupController::class, 'getAllTasks']);
Route::post('clickup_fetch_all_Teams', [ClickupController::class, 'getAllTeams']);
Route::post('clickup_fetch_all_Spaces', [ClickupController::class, 'getAllSpaces']);
Route::post('clickup_fetch_all_Folders', [ClickupController::class, 'getAllFolders']);
Route::post('clickup_fetch_all_Lists', [ClickupController::class, 'getAllLists']);
