<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Slack\SlackHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('slack_fetch_channels', [SlackHelper::class, 'fetchChannels']);
