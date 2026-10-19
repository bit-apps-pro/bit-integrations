<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Salesflare\SalesflareHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('Salesflare_custom_fields', [SalesflareHelper::class, 'customFields']);
Route::post('Salesflare_fetch_all_tags', [SalesflareHelper::class, 'getAllTags']);
Route::post('Salesflare_fetch_all_account', [SalesflareHelper::class, 'getAllAccounts']);
Route::post('Salesflare_fetch_all_pipelines', [SalesflareHelper::class, 'getAllPipelines']);
