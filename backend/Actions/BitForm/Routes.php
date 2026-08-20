<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitForm\BitFormController;
use BitApps\Integrations\Core\Util\Route;

Route::post('bitForm_all_form_list', [BitFormController::class, 'bitFormAllFormList']);
Route::post('bitForm_fetch_single_form_fields', [BitFormController::class, 'bitFormFetchSingleFormFields']);
