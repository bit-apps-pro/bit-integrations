<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\RestrictContent\RestrictContentController;
use BitApps\Integrations\Core\Util\Route;

Route::get('restrict_get_all_levels', [RestrictContentController::class, 'getAllLevels']);
