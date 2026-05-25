<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Bento\BentoController;
use BitApps\Integrations\Core\Util\Route;

Route::post('bento_get_fields', [BentoController::class, 'getAllFields']);
Route::post('bento_get_all_tags', [BentoController::class, 'getAlTags']);
