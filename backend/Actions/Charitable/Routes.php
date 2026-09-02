<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Charitable\CharitableController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_charitable_campaigns', [CharitableController::class, 'refreshCampaigns']);
Route::post('refresh_charitable_donation_statuses', [CharitableController::class, 'refreshDonationStatuses']);
Route::post('refresh_charitable_donors', [CharitableController::class, 'refreshDonors']);
Route::post('refresh_charitable_users', [CharitableController::class, 'refreshUsers']);
Route::post('refresh_charitable_campaign_categories', [CharitableController::class, 'refreshCampaignCategories']);
Route::post('refresh_charitable_campaign_tags', [CharitableController::class, 'refreshCampaignTags']);
Route::post('refresh_charitable_user_roles', [CharitableController::class, 'refreshUserRoles']);
