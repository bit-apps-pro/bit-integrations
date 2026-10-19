<?php

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TeamsForWooCommerceMemberships\TeamsForWooCommerceMembershipsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('teams_for_wc_memberships_refresh_teams', [TeamsForWooCommerceMembershipsHelper::class, 'refreshTeams']);
Route::post('teams_for_wc_memberships_refresh_member_roles', [TeamsForWooCommerceMembershipsHelper::class, 'refreshMemberRoles']);
