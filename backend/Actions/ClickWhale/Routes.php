<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ClickWhale\ClickWhaleController;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_clickwhale_authors', [ClickWhaleController::class, 'refreshAuthors']);
