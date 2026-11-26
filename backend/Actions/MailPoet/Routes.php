<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailPoet\MailPoetHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_news_letter', [MailPoetHelper::class, 'refreshNeswLetter']);
Route::post('mail_poet_list_headers', [MailPoetHelper::class, 'mailPoetListHeaders']);
