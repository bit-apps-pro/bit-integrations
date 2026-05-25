<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Zendesk\ZendeskController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zendesk_fetch_custom_fields', [ZendeskController::class, 'getCustomFields']);
Route::post('zendesk_fetch_all_leads', [ZendeskController::class, 'getAllLeads']);
Route::post('zendesk_fetch_all_parentOrganizations', [ZendeskController::class, 'getAllParentOrganizations']);
Route::post('zendesk_fetch_all_teams', [ZendeskController::class, 'getAllTeams']);
Route::post('zendesk_fetch_all_currencies', [ZendeskController::class, 'getAllCurrencies']);
Route::post('zendesk_fetch_all_stages', [ZendeskController::class, 'getAllStages']);
Route::post('zendesk_fetch_all_CRMCompanies', [ZendeskController::class, 'getAllCRMCompanies']);
Route::post('zendesk_fetch_all_CRMContacts', [ZendeskController::class, 'getAllCRMContacts']);
Route::post('zendesk_fetch_all_CRMSources', [ZendeskController::class, 'getAllCRMSources']);
