<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\HefflCRM\HefflCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_heffl_crm_lead_sources', [HefflCRMHelper::class, 'refreshLeadSources']);
Route::post('refresh_heffl_crm_lead_stages', [HefflCRMHelper::class, 'refreshLeadStages']);
Route::post('refresh_heffl_crm_pipelines', [HefflCRMHelper::class, 'refreshPipelines']);
Route::post('refresh_heffl_crm_pipeline_stages', [HefflCRMHelper::class, 'refreshPipelineStages']);
Route::post('refresh_heffl_crm_clients', [HefflCRMHelper::class, 'refreshClients']);
Route::post('refresh_heffl_crm_leads', [HefflCRMHelper::class, 'refreshLeads']);
