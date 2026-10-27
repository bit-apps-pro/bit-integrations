<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\QuickBooks\QuickBooksController;
use BitApps\Integrations\Core\Util\Route;

Route::post('quick_books_get_customers', [QuickBooksController::class, 'getCustomers']);
Route::post('quick_books_get_vendors', [QuickBooksController::class, 'getVendors']);
Route::post('quick_books_get_employees', [QuickBooksController::class, 'getEmployees']);
Route::post('quick_books_get_items', [QuickBooksController::class, 'getItems']);
Route::post('quick_books_get_accounts', [QuickBooksController::class, 'getAccounts']);
Route::post('quick_books_get_terms', [QuickBooksController::class, 'getTerms']);
Route::post('quick_books_get_payment_methods', [QuickBooksController::class, 'getPaymentMethods']);
Route::post('quick_books_get_classes', [QuickBooksController::class, 'getClasses']);
Route::post('quick_books_get_departments', [QuickBooksController::class, 'getDepartments']);
