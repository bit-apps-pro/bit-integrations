<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PCloud\PCloudController;
use BitApps\Integrations\Core\Util\Route;

Route::post('pCloud_get_all_folders', [PCloudController::class, 'getAllFolders']);
