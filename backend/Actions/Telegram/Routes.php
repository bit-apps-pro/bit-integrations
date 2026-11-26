<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Telegram\TelegramHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_get_updates', [TelegramHelper::class, 'refreshGetUpdates']);
