<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoCreator\ZohoCreatorController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zcreator_refresh_applications', [ZohoCreatorController::class, 'refreshApplicationsAjaxHelper']);
Route::post('zcreator_refresh_forms', [ZohoCreatorController::class, 'refreshFormsAjaxHelper']);
Route::post('zcreator_refresh_fields', [ZohoCreatorController::class, 'refreshFieldsAjaxHelper']);

// public static function registerAjax()
//     {
//         add_action('wp_ajax_zcreator_refresh_applications', array(__CLASS__, 'refreshApplicationsAjaxHelper'));
//         add_action('wp_ajax_zcreator_refresh_forms', array(__CLASS__, 'refreshFormsAjaxHelper'));
//         add_action('wp_ajax_zcreator_refresh_fields', array(__CLASS__, 'refreshFieldsAjaxHelper'));
//     }
