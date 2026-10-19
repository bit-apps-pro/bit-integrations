<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ElementsKit\ElementsKitController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_elements_kit_contents', [ElementsKitController::class, 'refreshDynamicContents']);
