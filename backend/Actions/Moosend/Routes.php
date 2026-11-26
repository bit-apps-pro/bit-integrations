<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Moosend\MoosendHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('moosend_lists', [MoosendHelper::class, 'getAllLists']);
