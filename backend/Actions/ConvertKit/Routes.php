<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ConvertKit\ConvertKitHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('convertKit_headers', [ConvertKitHelper::class, 'convertKitHeaders']);
Route::post('convertKit_forms', [ConvertKitHelper::class, 'convertKitForms']);
Route::post('convertKit_tags', [ConvertKitHelper::class, 'convertKitTags']);
