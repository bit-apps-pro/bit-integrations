<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailercloud\MailercloudController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailercloud_get_all_lists', [MailercloudController::class, 'getAllLists']);
Route::post('mailercloud_get_all_fields', [MailercloudController::class, 'getAllFields']);
