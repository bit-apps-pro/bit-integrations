<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoRecruit\ZohoRecruitHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zrecruit_refresh_modules', [ZohoRecruitHelper::class, 'refreshModules']);
Route::post('zrecruit_refresh_notetypes', [ZohoRecruitHelper::class, 'refreshNoteTypes']);
Route::post('zrecruit_refresh_related_lists', [ZohoRecruitHelper::class, 'refreshRelatedModules']);
Route::post('zrecruit_get_fields', [ZohoRecruitHelper::class, 'getFields']);
