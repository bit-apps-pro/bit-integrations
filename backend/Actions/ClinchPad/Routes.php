<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ClinchPad\ClinchPadController;
use BitApps\Integrations\Core\Util\Route;

Route::post('clinchPad_fetch_custom_fields', [ClinchPadController::class, 'getCustomFields']);
Route::post('clinchPad_fetch_all_leads', [ClinchPadController::class, 'getAllLeads']);
Route::post('clinchPad_fetch_all_parentOrganizations', [ClinchPadController::class, 'getAllParentOrganizations']);
Route::post('clinchPad_fetch_all_teams', [ClinchPadController::class, 'getAllTeams']);
Route::post('clinchPad_fetch_all_currencies', [ClinchPadController::class, 'getAllCurrencies']);
Route::post('clinchPad_fetch_all_CRMPipelines', [ClinchPadController::class, 'getAllCRMPipelines']);
Route::post('clinchPad_fetch_all_CRMContacts', [ClinchPadController::class, 'getAllCRMContacts']);
Route::post('clinchPad_fetch_all_CRMSources', [ClinchPadController::class, 'getAllCRMSources']);
