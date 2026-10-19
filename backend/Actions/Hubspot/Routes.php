<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Hubspot\HubspotHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('getFields', [HubspotHelper::class, 'getFields']);
Route::post('hubspot_pipeline', [HubspotHelper::class, 'getAllPipelines']);
Route::post('hubspot_owners', [HubspotHelper::class, 'getAllOwners']);
Route::post('hubspot_contacts', [HubspotHelper::class, 'getAllContacts']);
Route::post('hubspot_company', [HubspotHelper::class, 'getAllCompany']);
Route::post('hubspot_industry', [HubspotHelper::class, 'getAllIndustry']);
