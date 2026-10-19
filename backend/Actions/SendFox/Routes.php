<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SendFox\SendFoxHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('sendfox_fetch_all_list', [SendFoxHelper::class, 'fetchContactLists']);
