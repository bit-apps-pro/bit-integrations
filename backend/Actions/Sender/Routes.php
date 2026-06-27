<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Sender\SenderController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sender_authorize', [SenderController::class, 'senderAuthorize']);
Route::post('refresh_sender_groups', [SenderController::class, 'refreshGroups']);
Route::post('refresh_sender_fields', [SenderController::class, 'refreshFields']);
