<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Pointics\PointicsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_pointics_channels', [PointicsController::class, 'refreshChannels']);
