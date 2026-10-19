<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Vbout\VboutHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('vbout_fetch_all_lists', [VboutHelper::class, 'fetchAllLists']);
Route::post('vbout_refresh_fields', [VboutHelper::class, 'vboutRefreshFields']);
