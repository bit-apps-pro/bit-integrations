<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZagoMail\ZagoMailHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zagoMail_refresh_fields', [ZagoMailHelper::class, 'zagoMailRefreshFields']);
Route::post('zagoMail_lists', [ZagoMailHelper::class, 'zagoMailLists']);
Route::post('zagoMail_tags', [ZagoMailHelper::class, 'zagoMailTags']);
