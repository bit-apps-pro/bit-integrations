<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PropovoiceCRM\PropovoiceCRMController;
use BitApps\Integrations\Core\Util\Route;

Route::post('propovoice_crm_lead_tags', [PropovoiceCRMController::class, 'leadTags']);
Route::post('propovoice_crm_lead_label', [PropovoiceCRMController::class, 'leadLabel']);
