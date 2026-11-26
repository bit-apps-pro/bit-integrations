<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Salesforce\SalesforceHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('selesforce_custom_action', [SalesforceHelper::class, 'customActions']);
Route::post('selesforce_campaign_list', [SalesforceHelper::class, 'selesforceCampaignList']);
Route::post('selesforce_lead_list', [SalesforceHelper::class, 'selesforceLeadList']);
Route::post('selesforce_contact_list', [SalesforceHelper::class, 'selesforceContactList']);
Route::post('selesforce_custom_field', [SalesforceHelper::class, 'customFields']);

Route::post('selesforce_account_list', [SalesforceHelper::class, 'selesforceAccountList']);
Route::post('selesforce_user_list', [SalesforceHelper::class, 'selesforceUserList']);
Route::post('selesforce_case_origin', [SalesforceHelper::class, 'selesforceCaseOrigin']);
Route::post('selesforce_case_type', [SalesforceHelper::class, 'selesforceCaseType']);
Route::post('selesforce_case_reason', [SalesforceHelper::class, 'selesforceCaseReason']);
Route::post('selesforce_case_status', [SalesforceHelper::class, 'selesforceCaseStatus']);
Route::post('selesforce_case_priority', [SalesforceHelper::class, 'selesforceCasePriority']);
Route::post('selesforce_case_potential_liability', [SalesforceHelper::class, 'selesforceCasePotentialLiability']);
Route::post('selesforce_case_sla_violation', [SalesforceHelper::class, 'selesforceCaseSLAViolation']);
Route::post('selesforce_get_lead_sources', [SalesforceHelper::class, 'getAllLeadSources']);
Route::post('selesforce_get_lead_status', [SalesforceHelper::class, 'getAllLeadStatus']);
Route::post('selesforce_get_lead_ratings', [SalesforceHelper::class, 'getAllLeadRatings']);
Route::post('selesforce_get_lead_industries', [SalesforceHelper::class, 'getAllLeadIndustries']);
