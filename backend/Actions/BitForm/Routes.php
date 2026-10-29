<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BitForm\BitFormHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('bitForm_all_form_list', [BitFormHelper::class, 'bitFormAllFormList']);
Route::post('bitForm_fetch_single_form_fields', [BitFormHelper::class, 'bitFormFetchSingleFormFields']);
