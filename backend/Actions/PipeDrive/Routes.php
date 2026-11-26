<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PipeDrive\PipeDriveHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('PipeDrive_refresh_fields', [PipeDriveHelper::class, 'getFields']);
Route::post('PipeDrive_fetch_meta_data', [PipeDriveHelper::class, 'getMetaData']);
