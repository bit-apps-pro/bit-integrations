<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\DoubleScaleCrm\DoubleScaleCrmController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_double_scale_crm_tags', [DoubleScaleCrmController::class, 'refreshTags']);
Route::post('refresh_double_scale_crm_lists', [DoubleScaleCrmController::class, 'refreshLists']);
Route::post('refresh_double_scale_crm_users', [DoubleScaleCrmController::class, 'refreshUsers']);
Route::post('refresh_double_scale_crm_mailboxes', [DoubleScaleCrmController::class, 'refreshMailboxes']);
