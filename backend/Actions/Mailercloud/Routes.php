<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailercloud\MailercloudHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailercloud_get_all_lists', [MailercloudHelper::class, 'getAllLists']);
Route::post('mailercloud_get_all_fields', [MailercloudHelper::class, 'getAllFields']);
