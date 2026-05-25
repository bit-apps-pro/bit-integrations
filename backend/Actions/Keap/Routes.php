<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Keap\KeapController;
use BitApps\Integrations\Core\Util\Route;

Route::post('keap_fetch_all_tags', [KeapController::class, 'refreshTagListAjaxHelper']);
Route::post('keap_fetch_all_custom_fields', [KeapController::class, 'refreshCustomFieldAjaxHelper']);
