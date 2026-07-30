<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendinBlue\SendinBlueController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sblue_refresh_lists', [SendinBlueController::class, 'refreshlists']);
Route::post('sblue_headers', [SendinBlueController::class, 'sendinblueHeaders']);
Route::post('sblue_refresh_template', [SendinBlueController::class, 'refreshTemplate']);
