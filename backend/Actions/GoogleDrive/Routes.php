<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GoogleDrive\GoogleDriveController;
use BitApps\Integrations\Core\Util\Route;

Route::post('googleDrive_get_all_folders', [GoogleDriveController::class, 'getAllFolders']);
