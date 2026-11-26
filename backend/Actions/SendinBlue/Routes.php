<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendinBlue\SendinBlueHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('sblue_refresh_lists', [SendinBlueHelper::class, 'refreshlists']);
Route::post('sblue_headers', [SendinBlueHelper::class, 'sendinblueHeaders']);
Route::post('sblue_refresh_template', [SendinBlueHelper::class, 'refreshTemplate']);
