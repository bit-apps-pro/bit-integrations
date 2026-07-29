<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FluentSupport\FluentSupportController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fluent_support_get_custom_fields', [FluentSupportController::class, 'getCustomFields']);
Route::post('fluent_support_get_all_support_staff', [FluentSupportController::class, 'getAllSupportStaff']);
Route::post('fluent_support_get_all_business_inboxes', [FluentSupportController::class, 'getAllBusinessInboxes']);
