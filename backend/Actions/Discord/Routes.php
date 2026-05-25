<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Discord\DiscordController;
use BitApps\Integrations\Core\Util\Route;

// Discord
Route::post('discord_fetch_servers', [DiscordController::class, 'fetchServers']);
Route::post('discord_fetch_channels', [DiscordController::class, 'fetchChannels']);
