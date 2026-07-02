<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MoxieCRM\MoxieCRMController;
use BitApps\Integrations\Core\Util\Route;

// Route::post('moxiecrm_fetch_custom_fields', [MoxieCRMController::class, 'getCustomFields']);
Route::post('moxiecrm_fetch_all_opportunities', [MoxieCRMController::class, 'getAllOpportunities']);
Route::post('moxiecrm_fetch_all_clients', [MoxieCRMController::class, 'getAllClients']);
Route::post('moxiecrm_fetch_all_pipelineStages', [MoxieCRMController::class, 'getAllPipelineStages']);
Route::post('moxiecrm_fetch_all_CRMPeoples', [MoxieCRMController::class, 'getAllCRMPeoples']);
Route::post('moxiecrm_fetch_all_CRMPipelines', [MoxieCRMController::class, 'getAllCRMPipelines']);
