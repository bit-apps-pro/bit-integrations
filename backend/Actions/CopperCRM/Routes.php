<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CopperCRM\CopperCRMController;
use BitApps\Integrations\Core\Util\Route;

Route::post('coppercrm_fetch_custom_fields', [CopperCRMController::class, 'getCustomFields']);
Route::post('coppercrm_fetch_all_opportunities', [CopperCRMController::class, 'getAllOpportunities']);
Route::post('coppercrm_fetch_all_owners', [CopperCRMController::class, 'getAllOwners']);
Route::post('coppercrm_fetch_all_companies', [CopperCRMController::class, 'getAllCompanies']);
Route::post('coppercrm_fetch_all_tags', [CopperCRMController::class, 'getAllTags']);
Route::post('coppercrm_fetch_all_pipelineStages', [CopperCRMController::class, 'getAllPipelineStages']);
Route::post('coppercrm_fetch_all_CRMPeoples', [CopperCRMController::class, 'getAllCRMPeoples']);
Route::post('coppercrm_fetch_all_CRMPipelines', [CopperCRMController::class, 'getAllCRMPipelines']);
