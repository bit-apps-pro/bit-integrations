<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mautic\MauticController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mautic_get_fields', [MauticController::class, 'getAllFields']);
Route::post('mautic_get_tags', [MauticController::class, 'getAllTags']);
Route::post('mautic_get_users', [MauticController::class, 'getAllUsers']);
