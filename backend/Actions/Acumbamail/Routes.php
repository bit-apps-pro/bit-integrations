<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Acumbamail\AcumbamailController;
use BitApps\Integrations\Core\Util\Route;

Route::post('acumbamail_fetch_all_list', [AcumbamailController::class, 'fetchAllLists']);
Route::post('acumbamail_refresh_fields', [AcumbamailController::class, 'acumbamailRefreshFields']);
