<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LionDesk\LionDeskHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('lionDesk_fetch_custom_fields', [LionDeskHelper::class, 'getCustomFields']);
Route::post('lionDesk_fetch_all_tags', [LionDeskHelper::class, 'getAllTags']);
