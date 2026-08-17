<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ConstantContact\ConstantContactController;
use BitApps\Integrations\Core\Util\Route;

Route::post('cContact_refresh_list', [ConstantContactController::class, 'refreshList']);
Route::post('cContact_refresh_tags', [ConstantContactController::class, 'refreshTags']);
Route::post('cContact_custom_fields', [ConstantContactController::class, 'getCustomFields']);
