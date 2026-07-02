<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\NotificationX\NotificationXController;
use BitApps\Integrations\Core\Util\Route;

Route::post('notificationx_get_notifications_by_source', [NotificationXController::class, 'getNotificationsBySource']);
