<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BuddyBoss\BuddyBossHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_group', [BuddyBossHelper::class, 'getAllGroups']);
Route::post('fetch_all_user', [BuddyBossHelper::class, 'getAllUser']);
Route::post('fetch_all_forum', [BuddyBossHelper::class, 'getAllForums']);
Route::post('fetch_all_topic', [BuddyBossHelper::class, 'getAllTopics']);
