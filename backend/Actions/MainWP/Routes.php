<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MainWP\MainWPController;
use BitApps\Integrations\Core\Util\Route;

Route::post('main_wp_authorize', [MainWPController::class, 'mainWPAuthorize']);
Route::post('refresh_main_wp_sites', [MainWPController::class, 'refreshSites']);
