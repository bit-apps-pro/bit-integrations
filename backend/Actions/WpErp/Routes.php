<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpErp\WpErpController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wp_erp_authorize', [WpErpController::class, 'wpErpAuthorize']);
Route::post('refresh_wp_erp_contact_groups', [WpErpController::class, 'refreshContactGroups']);
Route::post('refresh_wp_erp_life_stages', [WpErpController::class, 'refreshLifeStages']);
Route::post('refresh_wp_erp_departments', [WpErpController::class, 'refreshDepartments']);
Route::post('refresh_wp_erp_designations', [WpErpController::class, 'refreshDesignations']);
