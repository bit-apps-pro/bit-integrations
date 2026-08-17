<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WPForo\WPForoController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wpforo_fetch_reputations', [WPForoController::class, 'getReputations']);
Route::post('wpforo_fetch_groups', [WPForoController::class, 'getGroups']);
Route::post('wpforo_fetch_forums', [WPForoController::class, 'getForums']);
Route::post('wpforo_fetch_topics', [WPForoController::class, 'getTopics']);
