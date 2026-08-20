<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FreshSales\FreshSalesController;
use BitApps\Integrations\Core\Util\Route;

Route::post('FreshSales_refresh_fields', [FreshSalesController::class, 'getFields']);
Route::post('FreshSales_fetch_meta_data', [FreshSalesController::class, 'getMetaData']);
