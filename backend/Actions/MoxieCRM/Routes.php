<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MoxieCRM\MoxieCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('moxiecrm_fetch_all_opportunities', [MoxieCRMHelper::class, 'getAllOpportunities']);
Route::post('moxiecrm_fetch_all_clients', [MoxieCRMHelper::class, 'getAllClients']);
Route::post('moxiecrm_fetch_all_pipelineStages', [MoxieCRMHelper::class, 'getAllPipelineStages']);
Route::post('moxiecrm_fetch_all_CRMPeoples', [MoxieCRMHelper::class, 'getAllCRMPeoples']);
Route::post('moxiecrm_fetch_all_CRMPipelines', [MoxieCRMHelper::class, 'getAllCRMPipelines']);
