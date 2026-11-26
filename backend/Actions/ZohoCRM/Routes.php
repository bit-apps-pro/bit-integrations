<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoCRM\ZohoCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zcrm_get_users', [ZohoCRMHelper::class, 'refreshUsersAjaxHelper']);
Route::post('zcrm_get_tags', [ZohoCRMHelper::class, 'refreshTagListAjaxHelper']);
Route::post('zcrm_get_assignment_rules', [ZohoCRMHelper::class, 'getAssignmentRulesAjaxHelper']);
Route::post('zcrm_get_related_lists', [ZohoCRMHelper::class, 'getRelatedListsAjaxHelper']);
Route::post('zcrm_refresh_modules', [ZohoCRMHelper::class, 'refreshModulesAjaxHelper']);
Route::post('zcrm_refresh_layouts', [ZohoCRMHelper::class, 'refreshLayoutsAjaxHelper']);
