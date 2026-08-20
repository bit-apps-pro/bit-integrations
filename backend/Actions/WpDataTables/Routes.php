<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpDataTables\WpDataTablesController;
use BitApps\Integrations\Core\Util\Route;

Route::get('wp_data_tables_get_tables', [WpDataTablesController::class, 'wpDataTablesGetTables']);
Route::post('wp_data_tables_get_table_columns', [WpDataTablesController::class, 'wpDataTablesGetTableColumns']);
