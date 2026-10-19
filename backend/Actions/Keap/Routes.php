<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Keap\KeapHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('keap_fetch_all_tags', [KeapHelper::class, 'refreshTagListAjaxHelper']);
Route::post('keap_fetch_all_custom_fields', [KeapHelper::class, 'refreshCustomFieldAjaxHelper']);
