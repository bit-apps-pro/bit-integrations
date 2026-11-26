<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Flowlu\FlowluHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('Flowlu_all_fields', [FlowluHelper::class, 'getAllFields']);
Route::post('flowlu_fetch_all_account_categories', [FlowluHelper::class, 'getAllAccountCategories']);
Route::post('flowlu_fetch_all_industries', [FlowluHelper::class, 'getAllIndustries']);
Route::post('flowlu_fetch_all_pipelines', [FlowluHelper::class, 'getAllPipelines']);
Route::post('flowlu_fetch_all_stages', [FlowluHelper::class, 'getAllStages']);
Route::post('flowlu_fetch_all_sources', [FlowluHelper::class, 'getAllSources']);
Route::post('flowlu_fetch_all_customers', [FlowluHelper::class, 'getAllCustomers']);
Route::post('flowlu_fetch_all_managers', [FlowluHelper::class, 'getAllManagers']);
Route::post('flowlu_fetch_all_project_tages', [FlowluHelper::class, 'getAllProjectStage']);
Route::post('flowlu_fetch_all_portfolio', [FlowluHelper::class, 'getAllPortfolio']);
Route::post('flowlu_fetch_all_project_opportunity', [FlowluHelper::class, 'getAllProjectOpportunity']);
