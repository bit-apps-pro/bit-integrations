<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PerfexCRM\PerfexCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('perfexcrm_custom_fields', [PerfexCRMHelper::class, 'getCustomFields']);
Route::post('perfexcrm_fetch_all_customers', [PerfexCRMHelper::class, 'getAllCustomer']);
Route::post('perfexcrm_fetch_all_leads', [PerfexCRMHelper::class, 'getAllLead']);
Route::post('perfexcrm_fetch_all_staffs', [PerfexCRMHelper::class, 'getAllStaff']);
