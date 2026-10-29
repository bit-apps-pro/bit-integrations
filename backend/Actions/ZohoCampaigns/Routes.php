<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoCampaigns\ZohoCampaignsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zcampaigns_refresh_lists', [ZohoCampaignsHelper::class, 'refreshLists']);
Route::post('zcampaigns_refresh_contact_fields', [ZohoCampaignsHelper::class, 'refreshContactFields']);
