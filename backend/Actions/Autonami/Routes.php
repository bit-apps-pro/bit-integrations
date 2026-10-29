<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Autonami\AutonamiHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('autonami_lists_and_tags', [AutonamiHelper::class, 'autonamiListsAndTags']);
Route::post('autonami_fields', [AutonamiHelper::class, 'autonamiFields']);
