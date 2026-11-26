<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SureMembers\SureMembersHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('sureMembers_fetch_groups', [SureMembersHelper::class, 'getGroups']);
