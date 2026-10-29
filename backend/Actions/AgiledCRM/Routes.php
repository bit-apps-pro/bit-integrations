<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\AgiledCRM\AgiledCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('agiled_fetch_all_owners', [AgiledCRMHelper::class, 'getAllOwners']);
Route::post('agiled_fetch_all_accounts', [AgiledCRMHelper::class, 'getAllAccounts']);
Route::post('agiled_fetch_all_sources', [AgiledCRMHelper::class, 'getAllSources']);
Route::post('agiled_fetch_all_statuses', [AgiledCRMHelper::class, 'getAllStatuses']);
Route::post('agiled_fetch_all_lifeCycleStages', [AgiledCRMHelper::class, 'getAllLifeCycleStage']);
Route::post('agiled_fetch_all_CRMPipelines', [AgiledCRMHelper::class, 'getAllCRMPipelines']);
Route::post('agiled_fetch_all_CRMPipelineStages', [AgiledCRMHelper::class, 'getAllCRMPipelineStages']);
