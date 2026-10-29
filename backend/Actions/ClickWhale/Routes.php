<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ClickWhale\ClickWhaleHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_clickwhale_authors', [ClickWhaleHelper::class, 'refreshAuthors']);
