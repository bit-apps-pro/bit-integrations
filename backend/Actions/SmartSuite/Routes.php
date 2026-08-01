<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SmartSuite\SmartSuiteController;
use BitApps\Integrations\Core\Util\Route;

Route::post('smartSuite_fetch_all_solutions', [SmartSuiteController::class, 'getAllSolutions']);
Route::post('smartSuite_fetch_all_tables', [SmartSuiteController::class, 'getAllTables']);
Route::post('smartSuite_fetch_all_user', [SmartSuiteController::class, 'getAllUser']);
