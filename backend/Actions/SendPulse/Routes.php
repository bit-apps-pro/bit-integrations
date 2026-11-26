<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendPulse\SendPulseHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('sendPulse_lists', [SendPulseHelper::class, 'getAllList']);
Route::post('sendPulse_headers', [SendPulseHelper::class, 'sendPulseHeaders']);
