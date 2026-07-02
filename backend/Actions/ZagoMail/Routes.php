<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZagoMail\ZagoMailController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zagoMail_refresh_fields', [ZagoMailController::class, 'zagoMailRefreshFields']);
Route::post('zagoMail_lists', [ZagoMailController::class, 'zagoMailLists']);
Route::post('zagoMail_tags', [ZagoMailController::class, 'zagoMailTags']);
