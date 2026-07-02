<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailify\MailifyController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailify_lists', [MailifyController::class, 'getAllList']);
Route::post('mailify_headers', [MailifyController::class, 'mailifyHeaders']);
