<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Discord\DiscordHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('discord_fetch_servers', [DiscordHelper::class, 'fetchServers']);
Route::post('discord_fetch_channels', [DiscordHelper::class, 'fetchChannels']);
