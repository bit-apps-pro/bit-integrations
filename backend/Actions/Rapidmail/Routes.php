<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Rapidmail\RapidmailHelper;
use BitApps\Integrations\Core\Util\Route;

Route::get('rapidmail_get_all_recipients', [RapidmailHelper::class, 'getAllRecipients']);
Route::get('rapidmail_get_all_fields', [RapidmailHelper::class, 'getAllFields']);
