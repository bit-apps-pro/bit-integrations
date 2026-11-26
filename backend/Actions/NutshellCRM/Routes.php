<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NutshellCRM\NutshellCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('nutshellcrm_fetch_all_contacts', [NutshellCRMHelper::class, 'getContacts']);
Route::post('nutshellcrm_fetch_all_products', [NutshellCRMHelper::class, 'getProducts']);
Route::post('nutshellcrm_fetch_all_sources', [NutshellCRMHelper::class, 'getSources']);
Route::post('nutshellcrm_fetch_all_tags', [NutshellCRMHelper::class, 'getTags']);
Route::post('nutshellcrm_fetch_all_companies', [NutshellCRMHelper::class, 'getCompanies']);
Route::post('nutshellcrm_fetch_all_companytypes', [NutshellCRMHelper::class, 'getCompanyTypes']);
