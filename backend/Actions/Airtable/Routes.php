<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Airtable\AirtableHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('airtable_fetch_all_bases', [AirtableHelper::class, 'fetchAllBases']);
Route::post('airtable_fetch_all_tables', [AirtableHelper::class, 'getAllTables']);
Route::post('airtable_fetch_all_fields', [AirtableHelper::class, 'getAllFields']);
