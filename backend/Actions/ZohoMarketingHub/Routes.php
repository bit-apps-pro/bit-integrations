<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoMarketingHub\ZohoMarketingHubController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zmarketingHub_refresh_lists', [ZohoMarketingHubController::class, 'refreshLists']);
Route::post('zmarketingHub_refresh_contact_fields', [ZohoMarketingHubController::class, 'refreshContactFields']);
