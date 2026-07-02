<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WhatsApp\WhatsAppController;
use BitApps\Integrations\Core\Util\Route;

Route::post('whats_app_all_template', [WhatsAppController::class, 'getAllTemplate']);
