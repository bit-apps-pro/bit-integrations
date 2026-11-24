<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SalonBookingSystem\SalonBookingSystemController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_salon_booking_system_services', [SalonBookingSystemController::class, 'refreshServices']);
Route::post('refresh_salon_booking_system_assistants', [SalonBookingSystemController::class, 'refreshAssistants']);
Route::post('refresh_salon_booking_system_statuses', [SalonBookingSystemController::class, 'refreshStatuses']);
Route::post('refresh_salon_booking_system_service_categories', [SalonBookingSystemController::class, 'refreshServiceCategories']);
