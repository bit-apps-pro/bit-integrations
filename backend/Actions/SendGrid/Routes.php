<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendGrid\SendGridHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('sendGrid_fetch_custom_fields', [SendGridHelper::class, 'getCustomFields']);
Route::post('sendGrid_fetch_all_lists', [SendGridHelper::class, 'getLists']);
