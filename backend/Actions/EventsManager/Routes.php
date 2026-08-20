<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\EventsManager\EventsManagerController;
use BitApps\Integrations\Core\Util\Route;

Route::post('eventsmanager_authorize', [EventsManagerController::class, 'eventsManagerAuthorize']);
