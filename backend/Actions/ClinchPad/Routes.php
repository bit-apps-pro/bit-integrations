<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ClinchPad\ClinchPadHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('clinchPad_fetch_all_parentOrganizations', [ClinchPadHelper::class, 'getAllParentOrganizations']);
Route::post('clinchPad_fetch_all_CRMPipelines', [ClinchPadHelper::class, 'getAllCRMPipelines']);
Route::post('clinchPad_fetch_all_CRMContacts', [ClinchPadHelper::class, 'getAllCRMContacts']);
