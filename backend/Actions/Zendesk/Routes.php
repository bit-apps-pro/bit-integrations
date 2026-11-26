<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Zendesk\ZendeskHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zendesk_fetch_custom_fields', [ZendeskHelper::class, 'getCustomFields']);
Route::post('zendesk_fetch_all_leads', [ZendeskHelper::class, 'getAllLeads']);
Route::post('zendesk_fetch_all_parentOrganizations', [ZendeskHelper::class, 'getAllParentOrganizations']);
Route::post('zendesk_fetch_all_teams', [ZendeskHelper::class, 'getAllTeams']);
Route::post('zendesk_fetch_all_currencies', [ZendeskHelper::class, 'getAllCurrencies']);
Route::post('zendesk_fetch_all_stages', [ZendeskHelper::class, 'getAllStages']);
Route::post('zendesk_fetch_all_CRMCompanies', [ZendeskHelper::class, 'getAllCRMCompanies']);
Route::post('zendesk_fetch_all_CRMContacts', [ZendeskHelper::class, 'getAllCRMContacts']);
Route::post('zendesk_fetch_all_CRMSources', [ZendeskHelper::class, 'getAllCRMSources']);
