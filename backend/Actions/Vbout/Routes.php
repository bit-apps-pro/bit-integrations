<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Vbout\VboutController;
use BitApps\Integrations\Core\Util\Route;

Route::post('vbout_fetch_all_lists', [VboutController::class, 'fetchAllLists']);
Route::post('vbout_refresh_fields', [VboutController::class, 'vboutRefreshFields']);
