<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Mailup\MailupController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailup_fetch_all_list', [MailupController::class, 'getAllList']);
Route::post('mailup_fetch_all_group', [MailupController::class, 'getAllGroup']);
Route::post('mailup_fetch_all_field', [MailupController::class, 'getAllField']);
