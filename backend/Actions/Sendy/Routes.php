<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Sendy\SendyController;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_all_brands', [SendyController::class, 'getAllBrands']);
Route::post('get_all_lists_from_sendy', [SendyController::class, 'getAllLists']);
// Route::post('mautic_get_fields', [ MauticController::class, 'getAllFields']);
// Route::post('mautic_get_tags', [ MauticController::class, 'getAllTags']);
