<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Sender\SenderHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_sender_groups', [SenderHelper::class, 'refreshGroups']);
Route::post('refresh_sender_fields', [SenderHelper::class, 'refreshFields']);
