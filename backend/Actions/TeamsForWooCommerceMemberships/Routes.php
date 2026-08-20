<?php

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TeamsForWooCommerceMemberships\TeamsForWooCommerceMembershipsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('teams_for_wc_memberships_refresh_teams', [TeamsForWooCommerceMembershipsController::class, 'refreshTeams']);
Route::post('teams_for_wc_memberships_refresh_member_roles', [TeamsForWooCommerceMembershipsController::class, 'refreshMemberRoles']);
