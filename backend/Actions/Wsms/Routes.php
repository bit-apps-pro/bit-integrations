<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Wsms\WsmsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wsms_groups', [WsmsController::class, 'refreshGroups']);
