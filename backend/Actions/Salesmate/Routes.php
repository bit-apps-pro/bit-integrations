<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Salesmate\SalesmateHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('Salesmate_fields', [SalesmateHelper::class, 'getAllFields']);
Route::post('salesmate_fetch_all_currencies', [SalesmateHelper::class, 'getAllCurrencies']);
Route::post('salesmate_fetch_all_tags', [SalesmateHelper::class, 'getAllTags']);
Route::post('salesmate_fetch_all_CRMPipelines', [SalesmateHelper::class, 'getAllCRMPipelines']);
Route::post('salesmate_fetch_all_CRMOwners', [SalesmateHelper::class, 'getAllCRMOwners']);
Route::post('salesmate_fetch_all_CRMContacts', [SalesmateHelper::class, 'getAllCRMContacts']);
Route::post('salesmate_fetch_all_CRMCompanies', [SalesmateHelper::class, 'getAllCRMCompanies']);
