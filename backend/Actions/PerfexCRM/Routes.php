<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PerfexCRM\PerfexCRMController;
use BitApps\Integrations\Core\Util\Route;

Route::post('perfexcrm_custom_fields', [PerfexCRMController::class, 'getCustomFields']);
Route::post('perfexcrm_fetch_all_customers', [PerfexCRMController::class, 'getAllCustomer']);
Route::post('perfexcrm_fetch_all_leads', [PerfexCRMController::class, 'getAllLead']);
Route::post('perfexcrm_fetch_all_staffs', [PerfexCRMController::class, 'getAllStaff']);
