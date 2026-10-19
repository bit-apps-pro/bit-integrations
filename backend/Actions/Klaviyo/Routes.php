<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Klaviyo\KlaviyoHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('klaviyo_lists', [KlaviyoHelper::class, 'getAllLists']);
