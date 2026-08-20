<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Route;
use BitApps\Integrations\Triggers\BitCrm\BitCrmController;

Route::get('bit-crm/get', [BitCrmController::class, 'getAllEvents']);
