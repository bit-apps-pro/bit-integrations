<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NextCrm\NextCrmHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_next_crm_tags', [NextCrmHelper::class, 'refreshTags']);
Route::post('refresh_next_crm_lists', [NextCrmHelper::class, 'refreshLists']);
Route::post('refresh_next_crm_campaigns', [NextCrmHelper::class, 'refreshCampaigns']);
Route::post('refresh_next_crm_contact_fields', [NextCrmHelper::class, 'refreshContactFields']);
Route::post('refresh_next_crm_contact_types', [NextCrmHelper::class, 'refreshContactTypes']);
Route::post('refresh_next_crm_contact_statuses', [NextCrmHelper::class, 'refreshContactStatuses']);
