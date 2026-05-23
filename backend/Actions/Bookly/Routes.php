<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Bookly\BooklyController;
use BitApps\Integrations\Core\Util\Route;

Route::post('bookly_authorize', [BooklyController::class, 'booklyAuthorize']);
Route::post('refresh_bookly_staff', [BooklyController::class, 'refreshStaff']);
Route::post('refresh_bookly_services', [BooklyController::class, 'refreshServices']);
Route::post('refresh_bookly_statuses', [BooklyController::class, 'refreshStatuses']);
