<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailerPress\MailerPressHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_mailer_press_lists', [MailerPressHelper::class, 'refreshLists']);
Route::post('refresh_mailer_press_tags', [MailerPressHelper::class, 'refreshTags']);
