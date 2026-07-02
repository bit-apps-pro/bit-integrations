<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ConvertForce\ConvertForceController;
use BitApps\Integrations\Core\Util\Route;

Route::post('convert_force_authorize', [ConvertForceController::class, 'convertForceAuthorize']);
