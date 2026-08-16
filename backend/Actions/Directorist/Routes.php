<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Directorist\DirectoristController;
use BitApps\Integrations\Core\Util\Route;

Route::post('directorist_authorize', [DirectoristController::class, 'directoristAuthorize']);
Route::post('refresh_directorist_directories', [DirectoristController::class, 'refreshDirectories']);
Route::post('refresh_directorist_categories', [DirectoristController::class, 'refreshCategories']);
Route::post('refresh_directorist_locations', [DirectoristController::class, 'refreshLocations']);
Route::post('refresh_directorist_tags', [DirectoristController::class, 'refreshTags']);
Route::post('refresh_directorist_users', [DirectoristController::class, 'refreshUsers']);
Route::post('refresh_directorist_listing_statuses', [DirectoristController::class, 'refreshListingStatuses']);
Route::post('refresh_directorist_order_statuses', [DirectoristController::class, 'refreshOrderStatuses']);
