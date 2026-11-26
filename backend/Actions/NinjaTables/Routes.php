<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NinjaTables\NinjaTablesHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_ninja_tables', [NinjaTablesHelper::class, 'refreshTables']);
Route::post('refresh_ninja_tables_rows', [NinjaTablesHelper::class, 'refreshRows']);
Route::post('refresh_ninja_tables_users', [NinjaTablesHelper::class, 'refreshUsers']);
Route::post('refresh_ninja_tables_columns', [NinjaTablesHelper::class, 'refreshColumns']);
