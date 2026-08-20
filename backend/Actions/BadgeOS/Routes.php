<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BadgeOS\BadgeOSController;
use BitApps\Integrations\Core\Util\Route;

Route::post('badgeos_authorize', [BadgeOSController::class, 'badgeOSAuthorize']);
Route::post('refresh_badgeos_achievements', [BadgeOSController::class, 'refreshAchievements']);
