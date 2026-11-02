<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\RestaurantReservations\RestaurantReservationsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_restaurant_reservations_statuses', [RestaurantReservationsController::class, 'refreshStatuses']);
Route::post('refresh_restaurant_reservations_locations', [RestaurantReservationsController::class, 'refreshLocations']);
Route::post('refresh_restaurant_reservations_tables', [RestaurantReservationsController::class, 'refreshTables']);
