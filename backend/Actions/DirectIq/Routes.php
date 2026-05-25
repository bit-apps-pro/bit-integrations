<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\DirectIq\DirectIqController;
use BitApps\Integrations\Core\Util\Route;

Route::post('directIq_headers', [DirectIqController::class, 'directIqHeaders']);
Route::post('directIq_lists', [DirectIqController::class, 'directIqLists']);
