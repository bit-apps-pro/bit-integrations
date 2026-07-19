<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpTableBuilder\WpTableBuilderController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wptablebuilder_authorize', [WpTableBuilderController::class, 'wpTableBuilderAuthorize']);

// Create/Update/Delete take table_id through the field map, so a flow can target a
// different table per run. Add Row is the exception: its column list has to be known
// while the flow is being configured, which only a fixed table can provide.
Route::post('refresh_wptablebuilder_tables', [WpTableBuilderController::class, 'refreshTables']);
Route::post('refresh_wptablebuilder_columns', [WpTableBuilderController::class, 'refreshColumns']);
