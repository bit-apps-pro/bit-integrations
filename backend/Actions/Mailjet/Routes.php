<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailjet\MailjetController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailjet_fetch_all_lists', [MailjetController::class, 'getAllLists']);
Route::post('mailjet_fetch_all_custom_fields', [MailjetController::class, 'getCustomFields']);
