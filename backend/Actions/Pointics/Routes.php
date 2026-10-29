<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Pointics\PointicsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_pointics_channels', [PointicsHelper::class, 'refreshChannels']);
