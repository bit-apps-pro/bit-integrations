<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\EmailOctopus\EmailOctopusHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('emailOctopus_fetch_all_lists', [EmailOctopusHelper::class, 'fetchAllLists']);
Route::post('emailOctopus_fetch_all_tags', [EmailOctopusHelper::class, 'getAllTags']);
Route::post('emailOctopus_fetch_all_fields', [EmailOctopusHelper::class, 'getAllFields']);
