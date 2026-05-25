<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SureMembers\SureMembersController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sureMembers_fetch_groups', [SureMembersController::class, 'getGroups']);
