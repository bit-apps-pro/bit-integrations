<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\RestrictContent\RestrictContentHelper;
use BitApps\Integrations\Core\Util\Route;

Route::get('restrict_get_all_levels', [RestrictContentHelper::class, 'getAllLevels']);
