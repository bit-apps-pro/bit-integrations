<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GetResponse\GetResponseController;
use BitApps\Integrations\Core\Util\Route;

Route::post('getresponse_fetch_all_tags', [GetResponseController::class, 'fetchAllTags']);
Route::post('getresponse_fetch_all_list', [GetResponseController::class, 'fetchAllList']);
Route::post('getresponse_fetch_custom_fields', [GetResponseController::class, 'fetchCustomFields']);
