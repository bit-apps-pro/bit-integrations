<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailPoet\MailPoetController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_news_letter', [MailPoetController::class, 'refreshNeswLetter']);
Route::post('mail_poet_list_headers', [MailPoetController::class, 'mailPoetListHeaders']);
