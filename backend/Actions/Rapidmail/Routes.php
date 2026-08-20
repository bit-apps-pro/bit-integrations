<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Rapidmail\RapidmailController;
use BitApps\Integrations\Core\Util\Route;

// Rapidmail
Route::get('rapidmail_get_all_recipients', [RapidmailController::class, 'getAllRecipients']);
Route::get('rapidmail_get_all_fields', [RapidmailController::class, 'getAllFields']);
