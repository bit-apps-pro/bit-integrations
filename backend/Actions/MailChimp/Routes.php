<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MailChimp\MailChimpHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mChimp_refresh_audience', [MailChimpHelper::class, 'refreshAudience']);
Route::post('mChimp_refresh_fields', [MailChimpHelper::class, 'refreshAudienceFields']);
Route::post('mChimp_refresh_tags', [MailChimpHelper::class, 'refreshTags']);
Route::post('mChimp_refresh_modules', [MailChimpHelper::class, 'refreshModules']);
