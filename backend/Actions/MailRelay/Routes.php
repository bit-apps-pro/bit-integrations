<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailRelay\MailRelayHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mailRelay_fetch_custom_fields', [MailRelayHelper::class, 'getCustomFields']);
Route::post('mailRelay_fetch_all_groups', [MailRelayHelper::class, 'getAllGroups']);
