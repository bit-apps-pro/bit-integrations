<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\DirectIq\DirectIqHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('directIq_headers', [DirectIqHelper::class, 'directIqHeaders']);
Route::post('directIq_lists', [DirectIqHelper::class, 'directIqLists']);
