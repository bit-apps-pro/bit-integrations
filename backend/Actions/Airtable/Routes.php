<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Airtable\AirtableController;
use BitApps\Integrations\Core\Util\Route;

Route::post('airtable_fetch_all_bases', [AirtableController::class, 'fetchAllBases']);
Route::post('airtable_fetch_all_tables', [AirtableController::class, 'getAllTables']);
Route::post('airtable_fetch_all_fields', [AirtableController::class, 'getAllFields']);
