<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitCrm\BitCrmController;
use BitApps\Integrations\Core\Util\Route;

Route::post('bitcrm_authorize', [BitCrmController::class, 'bitCrmAuthorize']);
