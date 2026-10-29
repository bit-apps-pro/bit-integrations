<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpDataTables\WpDataTablesHelper;
use BitApps\Integrations\Core\Util\Route;

Route::get('wp_data_tables_get_tables', [WpDataTablesHelper::class, 'wpDataTablesGetTables']);
Route::post('wp_data_tables_get_table_columns', [WpDataTablesHelper::class, 'wpDataTablesGetTableColumns']);
