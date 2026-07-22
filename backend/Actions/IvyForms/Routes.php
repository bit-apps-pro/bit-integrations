<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\IvyForms\IvyFormsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_ivy_forms_forms', [IvyFormsController::class, 'refreshForms']);
Route::post('refresh_ivy_forms_fields', [IvyFormsController::class, 'refreshFields']);
