<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SuiteDash\SuiteDashController;
use BitApps\Integrations\Core\Util\Route;

Route::post('suite_dash_fetch_all_fields', [SuiteDashController::class, 'getAllFields']);
Route::post('suite_dash_fetch_all_companies', [SuiteDashController::class, 'getAllCompanies']);
