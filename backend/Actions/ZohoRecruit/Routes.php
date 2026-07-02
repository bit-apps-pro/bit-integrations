<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoRecruit\ZohoRecruitController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zrecruit_refresh_modules', [ZohoRecruitController::class, 'refreshModules']);
Route::post('zrecruit_refresh_notetypes', [ZohoRecruitController::class, 'refreshNoteTypes']);
Route::post('zrecruit_refresh_related_lists', [ZohoRecruitController::class, 'refreshRelatedModules']);
Route::post('zrecruit_get_fields', [ZohoRecruitController::class, 'getFields']);
