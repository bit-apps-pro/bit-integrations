<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Bookly\BooklyHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_bookly_staff', [BooklyHelper::class, 'refreshStaff']);
Route::post('refresh_bookly_services', [BooklyHelper::class, 'refreshServices']);
Route::post('refresh_bookly_statuses', [BooklyHelper::class, 'refreshStatuses']);
