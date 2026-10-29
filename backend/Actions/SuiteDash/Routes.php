<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SuiteDash\SuiteDashHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('suite_dash_fetch_all_fields', [SuiteDashHelper::class, 'getAllFields']);
Route::post('suite_dash_fetch_all_companies', [SuiteDashHelper::class, 'getAllCompanies']);
