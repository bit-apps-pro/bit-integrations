<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WPForo\WPForoHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('wpforo_fetch_reputations', [WPForoHelper::class, 'getReputations']);
Route::post('wpforo_fetch_groups', [WPForoHelper::class, 'getGroups']);
Route::post('wpforo_fetch_forums', [WPForoHelper::class, 'getForums']);
Route::post('wpforo_fetch_topics', [WPForoHelper::class, 'getTopics']);
