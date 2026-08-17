<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LionDesk\LionDeskController;
use BitApps\Integrations\Core\Util\Route;

Route::post('lionDesk_fetch_custom_fields', [LionDeskController::class, 'getCustomFields']);
Route::post('lionDesk_fetch_all_tags', [LionDeskController::class, 'getAllTags']);
