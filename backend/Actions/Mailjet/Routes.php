<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailjet\MailjetHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailjet_fetch_all_lists', [MailjetHelper::class, 'getAllLists']);
Route::post('mailjet_fetch_all_custom_fields', [MailjetHelper::class, 'getCustomFields']);
