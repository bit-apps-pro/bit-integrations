<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Dokan\DokanController;
use BitApps\Integrations\Core\Util\Route;

Route::post('dokan_fetch_eu_fields', [DokanController::class, 'getEUFields']);
Route::post('dokan_fetch_vendors', [DokanController::class, 'getAllVendors']);
