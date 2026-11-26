<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NiroHelp\NiroHelpHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('niro_help_authorize', [NiroHelpHelper::class, 'niroHelpAuthorize']);
Route::post('refresh_niro_help_products', [NiroHelpHelper::class, 'refreshProducts']);
Route::post('refresh_niro_help_reasons', [NiroHelpHelper::class, 'refreshReasons']);
Route::post('refresh_niro_help_topics', [NiroHelpHelper::class, 'refreshTopics']);
Route::post('refresh_niro_help_agents', [NiroHelpHelper::class, 'refreshAgents']);
Route::post('refresh_niro_help_users', [NiroHelpHelper::class, 'refreshUsers']);
Route::post('refresh_niro_help_custom_fields', [NiroHelpHelper::class, 'refreshCustomFields']);
