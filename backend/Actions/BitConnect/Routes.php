<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitConnect\BitConnectHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_bit_connect_options', [BitConnectHelper::class, 'refreshOptions']);
