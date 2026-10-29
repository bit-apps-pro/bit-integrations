<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CampaignMonitor\CampaignMonitorHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('campaign_monitor_lists', [CampaignMonitorHelper::class, 'getAllLists']);
Route::post('campaign_monitor_custom_fields', [CampaignMonitorHelper::class, 'getCustomFields']);
