<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ZohoDesk\ZohoDeskHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('zdesk_refresh_organizations', [ZohoDeskHelper::class, 'refreshOrganizations']);
Route::post('zdesk_refresh_departments', [ZohoDeskHelper::class, 'refreshDepartments']);
Route::post('zdesk_refresh_fields', [ZohoDeskHelper::class, 'refreshFields']);
Route::post('zdesk_refresh_owners', [ZohoDeskHelper::class, 'refreshTicketOwners']);
Route::post('zdesk_refresh_products', [ZohoDeskHelper::class, 'refreshProducts']);
