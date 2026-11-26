<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Selzy\SelzyHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('selzy_get_all_lists', [SelzyHelper::class, 'getAllLists']);
Route::post('selzy_get_all_tags', [SelzyHelper::class, 'getAllTags']);
Route::post('selzy_get_all_custom_fields', [SelzyHelper::class, 'getAllCustomFields']);
