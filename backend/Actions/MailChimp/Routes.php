<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailChimp\MailChimpController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mChimp_refresh_audience', [MailChimpController::class, 'refreshAudience']);
Route::post('mChimp_refresh_fields', [MailChimpController::class, 'refreshAudienceFields']);
Route::post('mChimp_refresh_tags', [MailChimpController::class, 'refreshTags']);
Route::post('mChimp_refresh_modules', [MailChimpController::class, 'refreshModules']);
