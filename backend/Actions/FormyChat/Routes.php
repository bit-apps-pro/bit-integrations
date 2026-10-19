<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FormyChat\FormyChatHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_formy_chat_widgets', [FormyChatHelper::class, 'refreshWidgets']);
Route::post('refresh_formy_chat_widget_fields', [FormyChatHelper::class, 'refreshWidgetFields']);
