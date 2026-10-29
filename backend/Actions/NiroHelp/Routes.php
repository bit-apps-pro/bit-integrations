<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NiroHelp\NiroHelpController;
use BitApps\Integrations\Core\Util\Route;

Route::post('niro_help_authorize', [NiroHelpController::class, 'niroHelpAuthorize']);
Route::post('refresh_niro_help_products', [NiroHelpController::class, 'refreshProducts']);
Route::post('refresh_niro_help_reasons', [NiroHelpController::class, 'refreshReasons']);
Route::post('refresh_niro_help_topics', [NiroHelpController::class, 'refreshTopics']);
Route::post('refresh_niro_help_agents', [NiroHelpController::class, 'refreshAgents']);
Route::post('refresh_niro_help_users', [NiroHelpController::class, 'refreshUsers']);
Route::post('refresh_niro_help_custom_fields', [NiroHelpController::class, 'refreshCustomFields']);
