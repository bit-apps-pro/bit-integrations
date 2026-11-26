<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Insightly\InsightlyHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('insightly_fetch_all_organisations', [InsightlyHelper::class, 'getAllOrganisations']);
Route::post('insightly_fetch_all_categories', [InsightlyHelper::class, 'getAllCategories']);
Route::post('insightly_fetch_all_statuses', [InsightlyHelper::class, 'getAllStatuses']);
Route::post('insightly_fetch_all_LeadStatuses', [InsightlyHelper::class, 'getLeadStatuses']);
Route::post('insightly_fetch_all_LeadSources', [InsightlyHelper::class, 'getLeadSources']);
Route::post('insightly_fetch_all_CRMPipelines', [InsightlyHelper::class, 'getAllCRMPipelines']);
Route::post('insightly_fetch_all_CRMPipelineStages', [InsightlyHelper::class, 'getAllCRMPipelineStages']);
