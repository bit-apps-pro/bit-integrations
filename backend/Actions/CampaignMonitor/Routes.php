<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CampaignMonitor\CampaignMonitorController;
use BitApps\Integrations\Core\Util\Route;

Route::post('campaign_monitor_lists', [CampaignMonitorController::class, 'getAllLists']);
Route::post('campaign_monitor_custom_fields', [CampaignMonitorController::class, 'getCustomFields']);
