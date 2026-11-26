<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FreshSales\FreshSalesHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('FreshSales_refresh_fields', [FreshSalesHelper::class, 'getFields']);
Route::post('FreshSales_fetch_meta_data', [FreshSalesHelper::class, 'getMetaData']);
