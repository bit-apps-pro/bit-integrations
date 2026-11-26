<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Acumbamail\AcumbamailHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('acumbamail_fetch_all_list', [AcumbamailHelper::class, 'fetchAllLists']);
Route::post('acumbamail_refresh_fields', [AcumbamailHelper::class, 'acumbamailRefreshFields']);
