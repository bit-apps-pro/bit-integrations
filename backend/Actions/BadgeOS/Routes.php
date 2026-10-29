<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BadgeOS\BadgeOSHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_badgeos_achievements', [BadgeOSHelper::class, 'refreshAchievements']);
