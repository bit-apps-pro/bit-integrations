<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\PCloud\PCloudHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('pCloud_get_all_folders', [PCloudHelper::class, 'getAllFolders']);
