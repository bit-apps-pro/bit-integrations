<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\CopperCRM\CopperCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('coppercrm_fetch_custom_fields', [CopperCRMHelper::class, 'getCustomFields']);
Route::post('coppercrm_fetch_all_opportunities', [CopperCRMHelper::class, 'getAllOpportunities']);
Route::post('coppercrm_fetch_all_owners', [CopperCRMHelper::class, 'getAllOwners']);
Route::post('coppercrm_fetch_all_companies', [CopperCRMHelper::class, 'getAllCompanies']);
Route::post('coppercrm_fetch_all_tags', [CopperCRMHelper::class, 'getAllTags']);
Route::post('coppercrm_fetch_all_pipelineStages', [CopperCRMHelper::class, 'getAllPipelineStages']);
Route::post('coppercrm_fetch_all_CRMPeoples', [CopperCRMHelper::class, 'getAllCRMPeoples']);
Route::post('coppercrm_fetch_all_CRMPipelines', [CopperCRMHelper::class, 'getAllCRMPipelines']);
