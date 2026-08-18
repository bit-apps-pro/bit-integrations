<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SureContact\SureContactController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sure_contact_get_lists', [SureContactController::class, 'getLists']);
Route::post('sure_contact_get_tags', [SureContactController::class, 'getTags']);
