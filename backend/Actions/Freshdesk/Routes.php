<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Freshdesk\FreshdeskController;
use BitApps\Integrations\Core\Util\Route;

Route::post('freshdesk_fetch_ticket_fields', [FreshdeskController::class, 'getAllTicketFields']);
Route::post('freshdesk_fetch_Contact_fields', [FreshdeskController::class, 'getAllContactFields']);
