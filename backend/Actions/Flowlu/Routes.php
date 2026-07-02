<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Flowlu\FlowluController;
use BitApps\Integrations\Core\Util\Route;

Route::post('Flowlu_all_fields', [FlowluController::class, 'getAllFields']);
Route::post('flowlu_fetch_all_account_categories', [FlowluController::class, 'getAllAccountCategories']);
Route::post('flowlu_fetch_all_industries', [FlowluController::class, 'getAllIndustries']);
Route::post('flowlu_fetch_all_pipelines', [FlowluController::class, 'getAllPipelines']);
Route::post('flowlu_fetch_all_stages', [FlowluController::class, 'getAllStages']);
Route::post('flowlu_fetch_all_sources', [FlowluController::class, 'getAllSources']);
Route::post('flowlu_fetch_all_customers', [FlowluController::class, 'getAllCustomers']);
Route::post('flowlu_fetch_all_managers', [FlowluController::class, 'getAllManagers']);
Route::post('flowlu_fetch_all_project_tages', [FlowluController::class, 'getAllProjectStage']);
Route::post('flowlu_fetch_all_portfolio', [FlowluController::class, 'getAllPortfolio']);
Route::post('flowlu_fetch_all_project_opportunity', [FlowluController::class, 'getAllProjectOpportunity']);
