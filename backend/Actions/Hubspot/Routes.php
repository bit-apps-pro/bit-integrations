<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Hubspot\HubspotController;
use BitApps\Integrations\Core\Util\Route;

Route::post('getFields', [HubspotController::class, 'getFields']);
Route::post('hubspot_pipeline', [HubspotController::class, 'getAllPipelines']);
Route::post('hubspot_owners', [HubspotController::class, 'getAllOwners']);
Route::post('hubspot_contacts', [HubspotController::class, 'getAllContacts']);
Route::post('hubspot_company', [HubspotController::class, 'getAllCompany']);
Route::post('hubspot_industry', [HubspotController::class, 'getAllIndustry']);
