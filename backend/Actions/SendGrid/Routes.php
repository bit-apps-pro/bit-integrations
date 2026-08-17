<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendGrid\SendGridController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sendGrid_fetch_custom_fields', [SendGridController::class, 'getCustomFields']);
Route::post('sendGrid_fetch_all_lists', [SendGridController::class, 'getLists']);
