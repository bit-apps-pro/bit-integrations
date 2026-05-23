<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FormyChat\FormyChatController;
use BitApps\Integrations\Core\Util\Route;

Route::post('formy_chat_authorize', [FormyChatController::class, 'formyChatAuthorize']);
Route::post('refresh_formy_chat_widgets', [FormyChatController::class, 'refreshWidgets']);
Route::post('refresh_formy_chat_widget_fields', [FormyChatController::class, 'refreshWidgetFields']);
