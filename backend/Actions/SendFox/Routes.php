<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendFox\SendFoxController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sendfox_fetch_all_list', [SendFoxController::class, 'fetchContactLists']);
