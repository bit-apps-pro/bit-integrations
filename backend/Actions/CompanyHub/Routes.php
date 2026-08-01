<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CompanyHub\CompanyHubController;
use BitApps\Integrations\Core\Util\Route;

Route::post('company_hub_fetch_all_contacts', [CompanyHubController::class, 'getAllContacts']);
Route::post('company_hub_fetch_all_companies', [CompanyHubController::class, 'getAllCompanies']);
