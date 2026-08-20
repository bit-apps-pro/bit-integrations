<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\OneDrive\OneDriveController;
use BitApps\Integrations\Core\Util\Route;

Route::post('oneDrive_get_all_folders', [OneDriveController::class, 'getAllFolders']);
Route::post('oneDrive_get_single_folder', [OneDriveController::class, 'singleOneDriveFolderList']);
