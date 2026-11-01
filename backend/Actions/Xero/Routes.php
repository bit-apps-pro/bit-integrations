<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Xero\XeroController;
use BitApps\Integrations\Core\Util\Route;

Route::post('xero_get_contacts', [XeroController::class, 'getContacts']);
Route::post('xero_get_account_codes', [XeroController::class, 'getAccountCodes']);
Route::post('xero_get_bank_accounts', [XeroController::class, 'getBankAccounts']);
Route::post('xero_get_items', [XeroController::class, 'getItems']);
Route::post('xero_get_tax_rates', [XeroController::class, 'getTaxRates']);
Route::post('xero_get_currencies', [XeroController::class, 'getCurrencies']);
Route::post('xero_get_branding_themes', [XeroController::class, 'getBrandingThemes']);
