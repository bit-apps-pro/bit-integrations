<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mautic\MauticHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mautic_get_fields', [MauticHelper::class, 'getAllFields']);
Route::post('mautic_get_tags', [MauticHelper::class, 'getAllTags']);
Route::post('mautic_get_users', [MauticHelper::class, 'getAllUsers']);
