<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\RestaurantReservations\RestaurantReservationsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_restaurant_reservations_statuses', [RestaurantReservationsHelper::class, 'refreshStatuses']);
Route::post('refresh_restaurant_reservations_locations', [RestaurantReservationsHelper::class, 'refreshLocations']);
Route::post('refresh_restaurant_reservations_tables', [RestaurantReservationsHelper::class, 'refreshTables']);
