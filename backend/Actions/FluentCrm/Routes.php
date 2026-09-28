<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FluentCrm\FluentCrmHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_fluent_crm_lists', [FluentCrmHelper::class, 'fluentCrmLists']);
Route::post('refresh_fluent_crm_tags', [FluentCrmHelper::class, 'fluentCrmTags']);
Route::post('fluent_crm_headers', [FluentCrmHelper::class, 'fluentCrmFields']);
Route::post('fluent_crm_get_all_company', [FluentCrmHelper::class, 'getAllCompany']);
