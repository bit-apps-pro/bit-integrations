<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Woodpecker\WoodpeckerController;
use BitApps\Integrations\Core\Util\Route;

Route::post('woodpecker_fetch_all_campaigns', [WoodpeckerController::class, 'getAllCampagns']);
