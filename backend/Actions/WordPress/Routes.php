<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WordPress\WordPressController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wordpress_authorize', [WordPressController::class, 'wordPressAuthorize']);
