<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SureContact\SureContactHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('sure_contact_get_lists', [SureContactHelper::class, 'getLists']);
Route::post('sure_contact_get_tags', [SureContactHelper::class, 'getTags']);
