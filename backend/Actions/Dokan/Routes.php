<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Dokan\DokanHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('dokan_fetch_eu_fields', [DokanHelper::class, 'getEUFields']);
Route::post('dokan_fetch_vendors', [DokanHelper::class, 'getAllVendors']);
