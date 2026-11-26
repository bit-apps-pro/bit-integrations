<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpTableBuilder\WpTableBuilderHelper;
use BitApps\Integrations\Core\Util\Route;

// Create/Update/Delete take table_id through the field map, so a flow can target a
// different table per run. Add Row is the exception: its column list has to be known
// while the flow is being configured, which only a fixed table can provide.
Route::post('refresh_wptablebuilder_tables', [WpTableBuilderHelper::class, 'refreshTables']);
Route::post('refresh_wptablebuilder_columns', [WpTableBuilderHelper::class, 'refreshColumns']);
