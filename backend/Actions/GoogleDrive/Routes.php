<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GoogleDrive\GoogleDriveHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('googleDrive_get_all_folders', [GoogleDriveHelper::class, 'getAllFolders']);
