<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CompanyHub\CompanyHubHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('company_hub_fetch_all_contacts', [CompanyHubHelper::class, 'getAllContacts']);
Route::post('company_hub_fetch_all_companies', [CompanyHubHelper::class, 'getAllCompanies']);
