<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PropovoiceCRM\PropovoiceCRMHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('propovoice_crm_lead_tags', [PropovoiceCRMHelper::class, 'leadTags']);
Route::post('propovoice_crm_lead_label', [PropovoiceCRMHelper::class, 'leadLabel']);
