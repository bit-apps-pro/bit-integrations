<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Instasent\InstasentController;
use BitApps\Integrations\Core\Util\Route;

Route::post('instasent_authorize', [InstasentController::class, 'authorize']);
Route::post('refresh_instasent_datasources', [InstasentController::class, 'refreshDatasources']);
