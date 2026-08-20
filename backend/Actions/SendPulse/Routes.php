<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendPulse\SendPulseController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sendPulse_lists', [SendPulseController::class, 'getAllList']);
Route::post('sendPulse_headers', [SendPulseController::class, 'sendPulseHeaders']);
