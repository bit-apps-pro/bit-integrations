<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Woodpecker\WoodpeckerHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('woodpecker_fetch_all_campaigns', [WoodpeckerHelper::class, 'getAllCampagns']);
