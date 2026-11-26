<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MondayCom\MondayComHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mondayCom_fetch_boards', [MondayComHelper::class, 'getBoards']);
Route::post('mondayCom_fetch_groups', [MondayComHelper::class, 'getGroups']);
Route::post('mondayCom_fetch_columns', [MondayComHelper::class, 'getColumns']);
Route::post('mondayCom_fetch_items', [MondayComHelper::class, 'getItems']);
