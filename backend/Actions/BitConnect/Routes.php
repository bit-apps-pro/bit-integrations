<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitConnect\BitConnectController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_bit_connect_options', [BitConnectController::class, 'refreshOptions']);
