<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\VikRentCar\VikRentCarController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_vik_rent_car_cars', [VikRentCarController::class, 'refreshCars']);
Route::post('refresh_vik_rent_car_locations', [VikRentCarController::class, 'refreshLocations']);
Route::post('refresh_vik_rent_car_countries', [VikRentCarController::class, 'refreshCountries']);
