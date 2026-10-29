<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Booknetic\BookneticHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_booknetic_options', [BookneticHelper::class, 'refreshOptions']);
