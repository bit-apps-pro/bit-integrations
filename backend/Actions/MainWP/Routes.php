<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MainWP\MainWPHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_main_wp_sites', [MainWPHelper::class, 'refreshSites']);
