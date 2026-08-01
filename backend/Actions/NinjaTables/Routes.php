<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NinjaTables\NinjaTablesController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_ninja_tables', [NinjaTablesController::class, 'refreshTables']);
Route::post('refresh_ninja_tables_rows', [NinjaTablesController::class, 'refreshRows']);
Route::post('refresh_ninja_tables_users', [NinjaTablesController::class, 'refreshUsers']);
Route::post('refresh_ninja_tables_columns', [NinjaTablesController::class, 'refreshColumns']);
