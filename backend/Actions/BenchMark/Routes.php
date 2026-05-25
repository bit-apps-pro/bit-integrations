<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BenchMark\BenchMarkController;
use BitApps\Integrations\Core\Util\Route;

Route::post('benchMark_headers', [BenchMarkController::class, 'benchMarkHeaders']);
Route::post('benchMark_lists', [BenchMarkController::class, 'benchMarkLists']);
