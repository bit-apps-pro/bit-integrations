<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailerLite\MailerLiteHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailerlite_fetch_all_groups', [MailerLiteHelper::class, 'fetchAllGroups']);
Route::post('mailerlite_refresh_fields', [MailerLiteHelper::class, 'mailerliteRefreshFields']);
