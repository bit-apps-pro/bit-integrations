<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ActiveCampaign\ActiveCampaignHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('aCampaign_headers', [ActiveCampaignHelper::class, 'activeCampaignHeaders']);
Route::post('aCampaign_lists', [ActiveCampaignHelper::class, 'activeCampaignLists']);
Route::post('aCampaign_accounts', [ActiveCampaignHelper::class, 'activeCampaignAccounts']);
Route::post('aCampaign_tags', [ActiveCampaignHelper::class, 'activeCampaignTags']);
