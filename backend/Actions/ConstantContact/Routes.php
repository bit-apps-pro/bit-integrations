<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ConstantContact\ConstantContactHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('cContact_refresh_list', [ConstantContactHelper::class, 'refreshList']);
Route::post('cContact_refresh_tags', [ConstantContactHelper::class, 'refreshTags']);
Route::post('cContact_custom_fields', [ConstantContactHelper::class, 'getCustomFields']);
