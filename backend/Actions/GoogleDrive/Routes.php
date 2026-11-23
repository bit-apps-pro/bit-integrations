<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GoogleDrive\GoogleDriveController;
use BitApps\Integrations\Core\Util\Route;

Route::post('googleDrive_get_all_folders', [GoogleDriveController::class, 'getAllFolders']);
Route::post('googleDrive_browse_folders', [GoogleDriveController::class, 'browseFolders']);
Route::post('googleDrive_create_folder', [GoogleDriveController::class, 'createFolder']);
