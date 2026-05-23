<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MondayCom\MondayComController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mondayCom_authentication', [MondayComController::class, 'authentication']);
Route::post('mondayCom_fetch_boards', [MondayComController::class, 'getBoards']);
Route::post('mondayCom_fetch_groups', [MondayComController::class, 'getGroups']);
Route::post('mondayCom_fetch_columns', [MondayComController::class, 'getColumns']);
Route::post('mondayCom_fetch_items', [MondayComController::class, 'getItems']);
