<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Freshdesk\FreshdeskHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('freshdesk_fetch_ticket_fields', [FreshdeskHelper::class, 'getAllTicketFields']);
Route::post('freshdesk_fetch_Contact_fields', [FreshdeskHelper::class, 'getAllContactFields']);
