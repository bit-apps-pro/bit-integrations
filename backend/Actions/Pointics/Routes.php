<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Pointics\PointicsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_pointics_channels', [PointicsController::class, 'refreshChannels']);
Route::post('refresh_pointics_rewards', [PointicsController::class, 'refreshRewards']);
