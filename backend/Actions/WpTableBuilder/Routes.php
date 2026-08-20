<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpTableBuilder\WpTableBuilderController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wptablebuilder_tables', [WpTableBuilderController::class, 'refreshTables']);
Route::post('refresh_wptablebuilder_columns', [WpTableBuilderController::class, 'refreshColumns']);
