<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NextCrm\NextCrmController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_next_crm_tags', [NextCrmController::class, 'refreshTags']);
Route::post('refresh_next_crm_lists', [NextCrmController::class, 'refreshLists']);
Route::post('refresh_next_crm_campaigns', [NextCrmController::class, 'refreshCampaigns']);
Route::post('refresh_next_crm_contact_fields', [NextCrmController::class, 'refreshContactFields']);
Route::post('refresh_next_crm_contact_types', [NextCrmController::class, 'refreshContactTypes']);
Route::post('refresh_next_crm_contact_statuses', [NextCrmController::class, 'refreshContactStatuses']);
