<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Klaviyo\KlaviyoController;
use BitApps\Integrations\Core\Util\Route;

Route::post('klaviyo_lists', [KlaviyoController::class, 'getAllLists']);
