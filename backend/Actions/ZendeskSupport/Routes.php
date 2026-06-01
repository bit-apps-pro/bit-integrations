<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZendeskSupport\ZendeskSupportController;
use BitApps\Integrations\Core\Util\Route;

Route::post('zendesk_support_authorize', [ZendeskSupportController::class, 'authorize']);
Route::post('zendesk_support_refresh_groups', [ZendeskSupportController::class, 'refreshGroups']);
Route::post('zendesk_support_refresh_brands', [ZendeskSupportController::class, 'refreshBrands']);
Route::post('zendesk_support_refresh_ticket_forms', [ZendeskSupportController::class, 'refreshTicketForms']);
Route::post('zendesk_support_refresh_organizations', [ZendeskSupportController::class, 'refreshOrganizations']);
Route::post('zendesk_support_refresh_agents', [ZendeskSupportController::class, 'refreshAgents']);
