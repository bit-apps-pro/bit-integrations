<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BookingPress\BookingPressController;
use BitApps\Integrations\Core\Util\Route;

Route::post('bookingpress_authorize', [BookingPressController::class, 'bookingPressAuthorize']);
