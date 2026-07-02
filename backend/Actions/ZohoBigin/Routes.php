<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoBigin\ZohoBiginController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zbigin_refresh_modules', [ZohoBiginController::class, 'refreshModules']);
Route::post('zbigin_refresh_playouts', [ZohoBiginController::class, 'refreshPLayouts']);
Route::post('zbigin_refresh_related_lists', [ZohoBiginController::class, 'refreshRelatedModules']);
Route::post('zbigin_refresh_fields', [ZohoBiginController::class, 'getFields']);
Route::post('zbigin_refresh_tags', [ZohoBiginController::class, 'getTagList']);
Route::post('zbigin_refresh_users', [ZohoBiginController::class, 'getUsers']);
