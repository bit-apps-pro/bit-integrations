<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SmartSuite\SmartSuiteHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('smartSuite_fetch_all_solutions', [SmartSuiteHelper::class, 'getAllSolutions']);
Route::post('smartSuite_fetch_all_tables', [SmartSuiteHelper::class, 'getAllTables']);
Route::post('smartSuite_fetch_all_user', [SmartSuiteHelper::class, 'getAllUser']);
