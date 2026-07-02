<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailster\MailsterController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailster_fields', [MailsterController::class, 'getMailsterFields']);
Route::post('mailster_lists', [MailsterController::class, 'getMailsterLists']);
Route::post('mailster_tags', [MailsterController::class, 'getMailsterTags']);
