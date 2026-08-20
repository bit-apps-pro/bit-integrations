<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Autonami\AutonamiController;
use BitApps\Integrations\Core\Util\Route;

Route::post('autonami_lists_and_tags', [AutonamiController::class, 'autonamiListsAndTags']);
Route::post('autonami_fields', [AutonamiController::class, 'autonamiFields']);
