<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZendeskSupport\ZendeskSupportHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zendesk_support_refresh_groups', [ZendeskSupportHelper::class, 'refreshGroups']);
Route::post('zendesk_support_refresh_brands', [ZendeskSupportHelper::class, 'refreshBrands']);
Route::post('zendesk_support_refresh_ticket_forms', [ZendeskSupportHelper::class, 'refreshTicketForms']);
Route::post('zendesk_support_refresh_organizations', [ZendeskSupportHelper::class, 'refreshOrganizations']);
Route::post('zendesk_support_refresh_agents', [ZendeskSupportHelper::class, 'refreshAgents']);
