<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Sendy\SendyHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_all_brands', [SendyHelper::class, 'getAllBrands']);
Route::post('get_all_lists_from_sendy', [SendyHelper::class, 'getAllLists']);
