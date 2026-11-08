<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpActivityLog\WpActivityLogController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_activity_log_events', [WpActivityLogController::class, 'refreshEvents']);
Route::post('refresh_wp_activity_log_event_fields', [WpActivityLogController::class, 'refreshEventFields']);
Route::post('refresh_wp_activity_log_users', [WpActivityLogController::class, 'refreshUsers']);
Route::post('refresh_wp_activity_log_objects', [WpActivityLogController::class, 'refreshObjects']);
Route::post('refresh_wp_activity_log_event_types', [WpActivityLogController::class, 'refreshEventTypes']);
