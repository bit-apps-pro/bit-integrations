<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WpErp\WpErpHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_wp_erp_contact_groups', [WpErpHelper::class, 'refreshContactGroups']);
Route::post('refresh_wp_erp_life_stages', [WpErpHelper::class, 'refreshLifeStages']);
Route::post('refresh_wp_erp_departments', [WpErpHelper::class, 'refreshDepartments']);
Route::post('refresh_wp_erp_designations', [WpErpHelper::class, 'refreshDesignations']);
