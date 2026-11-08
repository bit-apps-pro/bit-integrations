<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Route;
use BitApps\Integrations\Triggers\BitConnect\BitConnectController;

Route::get('bit_connect/get', [BitConnectController::class, 'getAllTasks']);
