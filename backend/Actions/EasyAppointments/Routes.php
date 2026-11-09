<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\EasyAppointments\EasyAppointmentsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_easy_appointments_locations', [EasyAppointmentsController::class, 'refreshLocations']);
Route::post('refresh_easy_appointments_services', [EasyAppointmentsController::class, 'refreshServices']);
Route::post('refresh_easy_appointments_employees', [EasyAppointmentsController::class, 'refreshEmployees']);
Route::post('refresh_easy_appointments_statuses', [EasyAppointmentsController::class, 'refreshStatuses']);
Route::post('refresh_easy_appointments_users', [EasyAppointmentsController::class, 'refreshUsers']);
Route::post('refresh_easy_appointments_custom_fields', [EasyAppointmentsController::class, 'refreshCustomFields']);
