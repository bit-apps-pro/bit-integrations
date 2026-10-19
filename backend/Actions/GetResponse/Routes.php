<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GetResponse\GetResponseHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('getresponse_fetch_all_tags', [GetResponseHelper::class, 'fetchAllTags']);
Route::post('getresponse_fetch_all_list', [GetResponseHelper::class, 'fetchAllList']);
Route::post('getresponse_fetch_custom_fields', [GetResponseHelper::class, 'fetchCustomFields']);
