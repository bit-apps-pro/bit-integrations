<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Drip\DripHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('drip_fetch_all_accounts', [DripHelper::class, 'getAllAccounts']);
Route::post('drip_fetch_all_custom_fields', [DripHelper::class, 'getCustomFields']);
Route::post('drip_fetch_all_tags', [DripHelper::class, 'getAllTags']);
