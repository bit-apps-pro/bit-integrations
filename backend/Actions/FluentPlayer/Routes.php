<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FluentPlayer\FluentPlayerController;
use BitApps\Integrations\Core\Util\Route;

Route::post('fluent_player_authorize', [FluentPlayerController::class, 'fluentPlayerAuthorize']);
Route::post('refresh_fluent_player_media', [FluentPlayerController::class, 'refreshMedia']);
Route::post('refresh_fluent_player_tags', [FluentPlayerController::class, 'refreshTags']);
Route::post('refresh_fluent_player_presets', [FluentPlayerController::class, 'refreshPresets']);
Route::post('refresh_fluent_player_users', [FluentPlayerController::class, 'refreshUsers']);
Route::post('refresh_fluent_player_attachments', [FluentPlayerController::class, 'refreshAttachments']);
