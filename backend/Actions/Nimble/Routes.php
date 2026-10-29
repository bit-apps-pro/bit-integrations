<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Nimble\NimbleHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('nimble_fetch_all_fields', [NimbleHelper::class, 'getAllFields']);
