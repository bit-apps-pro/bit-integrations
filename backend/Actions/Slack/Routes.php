<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Slack\SlackController;
use BitApps\Integrations\Core\Util\Route;

// Slack
Route::post('slack_fetch_channels', [SlackController::class, 'fetchChannels']);
