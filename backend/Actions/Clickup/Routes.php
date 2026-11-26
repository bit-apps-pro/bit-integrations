<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Clickup\ClickupHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('clickup_fetch_custom_fields', [ClickupHelper::class, 'getCustomFields']);
Route::post('clickup_fetch_all_tasks', [ClickupHelper::class, 'getAllTasks']);
Route::post('clickup_fetch_all_Teams', [ClickupHelper::class, 'getAllTeams']);
Route::post('clickup_fetch_all_Spaces', [ClickupHelper::class, 'getAllSpaces']);
Route::post('clickup_fetch_all_Folders', [ClickupHelper::class, 'getAllFolders']);
Route::post('clickup_fetch_all_Lists', [ClickupHelper::class, 'getAllLists']);
