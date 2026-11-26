<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SystemeIO\SystemeIOHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('systemeIO_fetch_all_fields', [SystemeIOHelper::class, 'getAllFields']);
Route::post('systemeIO_fetch_all_tags', [SystemeIOHelper::class, 'getAllTags']);
