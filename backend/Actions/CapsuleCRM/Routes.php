<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CapsuleCRM\CapsuleCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('capsulecrm_fetch_custom_fields', [CapsuleCRMHelper::class, 'getCustomFields']);
Route::post('capsulecrm_fetch_all_opportunities', [CapsuleCRMHelper::class, 'getAllOpportunities']);
Route::post('capsulecrm_fetch_all_owners', [CapsuleCRMHelper::class, 'getAllOwners']);
Route::post('capsulecrm_fetch_all_teams', [CapsuleCRMHelper::class, 'getAllTeams']);
Route::post('capsulecrm_fetch_all_currencies', [CapsuleCRMHelper::class, 'getAllCurrencies']);
Route::post('capsulecrm_fetch_all_CRMParties', [CapsuleCRMHelper::class, 'getAllCRMParties']);
Route::post('capsulecrm_fetch_all_CRMMilestones', [CapsuleCRMHelper::class, 'getAllCRMMilestones']);
