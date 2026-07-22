<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BuddyBoss\BuddyBossController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fetch_all_group', [BuddyBossController::class, 'getAllGroups']);
Route::post('fetch_all_user', [BuddyBossController::class, 'getAllUser']);
Route::post('fetch_all_forum', [BuddyBossController::class, 'getAllForums']);
Route::post('fetch_all_topic', [BuddyBossController::class, 'getAllTopics']);
