<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Telegram\TelegramController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_get_updates', [TelegramController::class, 'refreshGetUpdates']);
