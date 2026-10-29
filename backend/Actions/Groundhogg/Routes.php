<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Groundhogg\GroundhoggHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('groundhogg_fetch_all_tags', [GroundhoggHelper::class, 'groundhoggFetchAllTags']);
