<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WhatsApp\WhatsAppHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('whats_app_all_template', [WhatsAppHelper::class, 'getAllTemplate']);
