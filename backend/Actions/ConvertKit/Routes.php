<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ConvertKit\ConvertKitController;
use BitApps\Integrations\Core\Util\Route;

Route::post('convertKit_headers', [ConvertKitController::class, 'convertKitHeaders']);
Route::post('convertKit_forms', [ConvertKitController::class, 'convertKitForms']);
Route::post('convertKit_tags', [ConvertKitController::class, 'convertKitTags']);
