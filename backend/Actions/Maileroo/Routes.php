<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Maileroo\MailerooController;
use BitApps\Integrations\Core\Util\Route;

Route::post('maileroo_get_domains', [MailerooController::class, 'getDomains']);
Route::post('maileroo_get_templates', [MailerooController::class, 'getTemplates']);
Route::post('maileroo_get_dedicated_ips', [MailerooController::class, 'getDedicatedIps']);
