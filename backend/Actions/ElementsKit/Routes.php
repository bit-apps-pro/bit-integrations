<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ElementsKit\ElementsKitHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_elements_kit_contents', [ElementsKitHelper::class, 'refreshDynamicContents']);
