<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\ElasticEmail\ElasticEmailHelper;
use BitApps\Integrations\Core\Util\Route;

Route::get('get_all_lists', [ElasticEmailHelper::class, 'getAllLists']);
