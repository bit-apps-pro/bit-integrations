<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Pushbullet\PushbulletController;
use BitApps\Integrations\Core\Util\Route;

Route::post('pushbullet_get_devices', [PushbulletController::class, 'getDevices']);
Route::post('pushbullet_get_channels', [PushbulletController::class, 'getChannels']);
