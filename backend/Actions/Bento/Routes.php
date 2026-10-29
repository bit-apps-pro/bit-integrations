<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Bento\BentoHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('bento_get_fields', [BentoHelper::class, 'getAllFields']);
Route::post('bento_get_all_tags', [BentoHelper::class, 'getAlTags']);
