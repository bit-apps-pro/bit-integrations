<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BuddyBoss\BuddyBossHelper;
use BitApps\Integrations\Core\Util\Hooks;

Hooks::filter('bp_notifications_get_registered_components', [BuddyBossHelper::class, 'registerComponents'], 10, 2);
Hooks::filter('bp_notifications_get_notifications_for_user', [BuddyBossHelper::class, 'notificationForUser'], 10, 8);
