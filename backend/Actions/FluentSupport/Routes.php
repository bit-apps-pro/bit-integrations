<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FluentSupport\FluentSupportHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('fluent_support_get_custom_fields', [FluentSupportHelper::class, 'getCustomFields']);
Route::post('fluent_support_get_all_support_staff', [FluentSupportHelper::class, 'getAllSupportStaff']);
Route::post('fluent_support_get_all_business_inboxes', [FluentSupportHelper::class, 'getAllBusinessInboxes']);
