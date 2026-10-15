<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FreshBooks\FreshBooksController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fresh_books_get_accounts', [FreshBooksController::class, 'getAccounts']);
Route::post('fresh_books_get_businesses', [FreshBooksController::class, 'getBusinesses']);
Route::post('fresh_books_get_clients', [FreshBooksController::class, 'getClients']);
Route::post('fresh_books_get_business_clients', [FreshBooksController::class, 'getBusinessClients']);
Route::post('fresh_books_get_categories', [FreshBooksController::class, 'getCategories']);
Route::post('fresh_books_get_staff', [FreshBooksController::class, 'getStaff']);
Route::post('fresh_books_get_vendors', [FreshBooksController::class, 'getVendors']);
Route::post('fresh_books_get_taxes', [FreshBooksController::class, 'getTaxes']);
Route::post('fresh_books_get_invoices', [FreshBooksController::class, 'getInvoices']);
Route::post('fresh_books_get_projects', [FreshBooksController::class, 'getProjects']);
Route::post('fresh_books_get_services', [FreshBooksController::class, 'getServices']);
Route::post('fresh_books_get_team_members', [FreshBooksController::class, 'getTeamMembers']);
