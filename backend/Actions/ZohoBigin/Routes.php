<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoBigin\ZohoBiginHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zbigin_refresh_modules', [ZohoBiginHelper::class, 'refreshModules']);
Route::post('zbigin_refresh_playouts', [ZohoBiginHelper::class, 'refreshPLayouts']);
Route::post('zbigin_refresh_related_lists', [ZohoBiginHelper::class, 'refreshRelatedModules']);
Route::post('zbigin_refresh_fields', [ZohoBiginHelper::class, 'getFields']);
Route::post('zbigin_refresh_tags', [ZohoBiginHelper::class, 'getTagList']);
Route::post('zbigin_refresh_users', [ZohoBiginHelper::class, 'getUsers']);
