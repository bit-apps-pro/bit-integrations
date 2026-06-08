<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\IvyForms\IvyFormsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('ivy_forms_authorize', [IvyFormsController::class, 'ivyFormsAuthorize']);
Route::post('refresh_ivy_forms_forms', [IvyFormsController::class, 'refreshForms']);
Route::post('refresh_ivy_forms_fields', [IvyFormsController::class, 'refreshFields']);
