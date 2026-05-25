<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Moosend\MoosendController;
use BitApps\Integrations\Core\Util\Route;

Route::post('moosend_lists', [MoosendController::class, 'getAllLists']);
