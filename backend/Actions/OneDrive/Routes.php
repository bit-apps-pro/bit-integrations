<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\OneDrive\OneDriveHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('oneDrive_get_all_folders', [OneDriveHelper::class, 'getAllFolders']);
Route::post('oneDrive_get_single_folder', [OneDriveHelper::class, 'singleOneDriveFolderList']);
