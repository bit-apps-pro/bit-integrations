<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Charitable\CharitableHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_charitable_campaigns', [CharitableHelper::class, 'refreshCampaigns']);
Route::post('refresh_charitable_donation_statuses', [CharitableHelper::class, 'refreshDonationStatuses']);
Route::post('refresh_charitable_donors', [CharitableHelper::class, 'refreshDonors']);
Route::post('refresh_charitable_users', [CharitableHelper::class, 'refreshUsers']);
Route::post('refresh_charitable_campaign_categories', [CharitableHelper::class, 'refreshCampaignCategories']);
Route::post('refresh_charitable_campaign_tags', [CharitableHelper::class, 'refreshCampaignTags']);
Route::post('refresh_charitable_user_roles', [CharitableHelper::class, 'refreshUserRoles']);
