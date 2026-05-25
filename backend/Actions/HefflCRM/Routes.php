<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\HefflCRM\HefflCRMController;
use BitApps\Integrations\Core\Util\Route;

Route::post('heffl_crm_authorize', [HefflCRMController::class, 'hefflCRMAuthorize']);
Route::post('refresh_heffl_crm_lead_sources', [HefflCRMController::class, 'refreshLeadSources']);
Route::post('refresh_heffl_crm_lead_stages', [HefflCRMController::class, 'refreshLeadStages']);
Route::post('refresh_heffl_crm_pipelines', [HefflCRMController::class, 'refreshPipelines']);
Route::post('refresh_heffl_crm_pipeline_stages', [HefflCRMController::class, 'refreshPipelineStages']);
Route::post('refresh_heffl_crm_clients', [HefflCRMController::class, 'refreshClients']);
Route::post('refresh_heffl_crm_leads', [HefflCRMController::class, 'refreshLeads']);
