<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpActivityLog\WpActivityLogHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_activity_log_events', [WpActivityLogHelper::class, 'refreshEvents']);
Route::post('refresh_wp_activity_log_event_fields', [WpActivityLogHelper::class, 'refreshEventFields']);
Route::post('refresh_wp_activity_log_users', [WpActivityLogHelper::class, 'refreshUsers']);
Route::post('refresh_wp_activity_log_objects', [WpActivityLogHelper::class, 'refreshObjects']);
Route::post('refresh_wp_activity_log_event_types', [WpActivityLogHelper::class, 'refreshEventTypes']);
