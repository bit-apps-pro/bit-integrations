<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailRelay\MailRelayController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailRelay_fetch_custom_fields', [MailRelayController::class, 'getCustomFields']);
Route::post('mailRelay_fetch_all_groups', [MailRelayController::class, 'getAllGroups']);
