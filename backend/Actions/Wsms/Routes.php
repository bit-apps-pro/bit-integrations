<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Wsms\WsmsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wsms_groups', [WsmsHelper::class, 'refreshGroups']);
