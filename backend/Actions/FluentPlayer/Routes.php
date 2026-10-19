<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FluentPlayer\FluentPlayerHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_fluent_player_media', [FluentPlayerHelper::class, 'refreshMedia']);
Route::post('refresh_fluent_player_tags', [FluentPlayerHelper::class, 'refreshTags']);
Route::post('refresh_fluent_player_presets', [FluentPlayerHelper::class, 'refreshPresets']);
Route::post('refresh_fluent_player_users', [FluentPlayerHelper::class, 'refreshUsers']);
Route::post('refresh_fluent_player_attachments', [FluentPlayerHelper::class, 'refreshAttachments']);
