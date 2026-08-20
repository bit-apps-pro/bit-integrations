<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Selzy\SelzyController;
use BitApps\Integrations\Core\Util\Route;

Route::post('selzy_get_all_lists', [SelzyController::class, 'getAllLists']);
Route::post('selzy_get_all_tags', [SelzyController::class, 'getAllTags']);
Route::post('selzy_get_all_custom_fields', [SelzyController::class, 'getAllCustomFields']);
