<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailster\MailsterHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailster_fields', [MailsterHelper::class, 'getMailsterFields']);
Route::post('mailster_lists', [MailsterHelper::class, 'getMailsterLists']);
Route::post('mailster_tags', [MailsterHelper::class, 'getMailsterTags']);
