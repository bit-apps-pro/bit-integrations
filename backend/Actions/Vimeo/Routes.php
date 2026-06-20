<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Vimeo\VimeoController;
use BitApps\Integrations\Core\Util\Route;

Route::post('vimeo_authorize', [VimeoController::class, 'vimeoAuthorize']);
Route::post('refresh_vimeo_videos', [VimeoController::class, 'refreshVideos']);
Route::post('refresh_vimeo_showcases', [VimeoController::class, 'refreshShowcases']);
Route::post('refresh_vimeo_folders', [VimeoController::class, 'refreshFolders']);
Route::post('refresh_vimeo_channels', [VimeoController::class, 'refreshChannels']);
