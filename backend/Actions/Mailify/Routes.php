<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailify\MailifyHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailify_lists', [MailifyHelper::class, 'getAllList']);
Route::post('mailify_headers', [MailifyHelper::class, 'mailifyHeaders']);
