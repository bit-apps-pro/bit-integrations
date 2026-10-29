<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitCrm\BitCrmHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_bitcrm_currencies', [BitCrmHelper::class, 'refreshCurrencies']);
Route::post('refresh_bitcrm_deal_stages', [BitCrmHelper::class, 'refreshDealStages']);
Route::post('refresh_bitcrm_invoice_terms', [BitCrmHelper::class, 'refreshInvoiceTerms']);
Route::post('refresh_bitcrm_contacts', [BitCrmHelper::class, 'refreshContacts']);
Route::post('refresh_bitcrm_companies', [BitCrmHelper::class, 'refreshCompanies']);
Route::post('refresh_bitcrm_users', [BitCrmHelper::class, 'refreshUsers']);
Route::post('refresh_bitcrm_entities', [BitCrmHelper::class, 'refreshEntities']);
Route::post('refresh_bitcrm_fields', [BitCrmHelper::class, 'refreshFields']);
Route::post('refresh_bitcrm_lead_tags', [BitCrmHelper::class, 'refreshLeadTags']);
Route::post('refresh_bitcrm_contact_tags', [BitCrmHelper::class, 'refreshContactTags']);
Route::post('refresh_bitcrm_company_tags', [BitCrmHelper::class, 'refreshCompanyTags']);
Route::post('refresh_bitcrm_deal_tags', [BitCrmHelper::class, 'refreshDealTags']);
Route::post('refresh_bitcrm_product_tags', [BitCrmHelper::class, 'refreshProductTags']);
