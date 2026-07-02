<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoCampaigns\ZohoCampaignsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zcampaigns_refresh_lists', [ZohoCampaignsController::class, 'refreshLists']);
Route::post('zcampaigns_refresh_contact_fields', [ZohoCampaignsController::class, 'refreshContactFields']);
