<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ClinchPad\ClinchPadController;
use BitApps\Integrations\Core\Util\Route;

Route::post('clinchPad_fetch_all_parentOrganizations', [ClinchPadController::class, 'getAllParentOrganizations']);
Route::post('clinchPad_fetch_all_CRMPipelines', [ClinchPadController::class, 'getAllCRMPipelines']);
Route::post('clinchPad_fetch_all_CRMContacts', [ClinchPadController::class, 'getAllCRMContacts']);
