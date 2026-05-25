<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SystemeIO\SystemeIOController;
use BitApps\Integrations\Core\Util\Route;

Route::post('systemeIO_fetch_all_fields', [SystemeIOController::class, 'getAllFields']);
Route::post('systemeIO_fetch_all_tags', [SystemeIOController::class, 'getAllTags']);
