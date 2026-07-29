<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitCrm\BitCrmController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_bitcrm_currencies', [BitCrmController::class, 'refreshCurrencies']);
Route::post('refresh_bitcrm_deal_stages', [BitCrmController::class, 'refreshDealStages']);
Route::post('refresh_bitcrm_invoice_terms', [BitCrmController::class, 'refreshInvoiceTerms']);
Route::post('refresh_bitcrm_contacts', [BitCrmController::class, 'refreshContacts']);
Route::post('refresh_bitcrm_companies', [BitCrmController::class, 'refreshCompanies']);
Route::post('refresh_bitcrm_users', [BitCrmController::class, 'refreshUsers']);
Route::post('refresh_bitcrm_entities', [BitCrmController::class, 'refreshEntities']);
Route::post('refresh_bitcrm_lead_tags', [BitCrmController::class, 'refreshLeadTags']);
Route::post('refresh_bitcrm_contact_tags', [BitCrmController::class, 'refreshContactTags']);
Route::post('refresh_bitcrm_company_tags', [BitCrmController::class, 'refreshCompanyTags']);
Route::post('refresh_bitcrm_deal_tags', [BitCrmController::class, 'refreshDealTags']);
Route::post('refresh_bitcrm_product_tags', [BitCrmController::class, 'refreshProductTags']);
