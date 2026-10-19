<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BenchMark\BenchMarkHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('benchMark_headers', [BenchMarkHelper::class, 'benchMarkHeaders']);
Route::post('benchMark_lists', [BenchMarkHelper::class, 'benchMarkLists']);
