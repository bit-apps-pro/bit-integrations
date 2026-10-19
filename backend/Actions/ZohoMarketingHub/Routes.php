<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoMarketingHub\ZohoMarketingHubHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zmarketingHub_refresh_lists', [ZohoMarketingHubHelper::class, 'refreshLists']);
Route::post('zmarketingHub_refresh_contact_fields', [ZohoMarketingHubHelper::class, 'refreshContactFields']);
