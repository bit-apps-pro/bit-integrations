<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\IvyForms\IvyFormsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_ivy_forms_forms', [IvyFormsHelper::class, 'refreshForms']);
Route::post('refresh_ivy_forms_fields', [IvyFormsHelper::class, 'refreshFields']);
