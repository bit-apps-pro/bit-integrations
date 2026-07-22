<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Drip\DripController;
use BitApps\Integrations\Core\Util\Route;

Route::post('drip_fetch_all_accounts', [DripController::class, 'getAllAccounts']);
Route::post('drip_fetch_all_custom_fields', [DripController::class, 'getCustomFields']);
Route::post('drip_fetch_all_tags', [DripController::class, 'getAllTags']);
