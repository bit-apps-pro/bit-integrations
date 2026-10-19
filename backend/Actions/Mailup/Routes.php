<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailup\MailupHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailup_fetch_all_list', [MailupHelper::class, 'getAllList']);
Route::post('mailup_fetch_all_group', [MailupHelper::class, 'getAllGroup']);
Route::post('mailup_fetch_all_field', [MailupHelper::class, 'getAllField']);
