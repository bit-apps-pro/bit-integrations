<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FollowUpBoss\FollowUpBossController;
use BitApps\Integrations\Core\Util\Route;

Route::post('follow_up_boss_get_users', [FollowUpBossController::class, 'getUsers']);
Route::post('follow_up_boss_get_stage_names', [FollowUpBossController::class, 'getStageNames']);
Route::post('follow_up_boss_get_stages', [FollowUpBossController::class, 'getStages']);
Route::post('follow_up_boss_get_ponds', [FollowUpBossController::class, 'getPonds']);
Route::post('follow_up_boss_get_timeframes', [FollowUpBossController::class, 'getTimeframes']);
Route::post('follow_up_boss_get_action_plans', [FollowUpBossController::class, 'getActionPlans']);
Route::post('follow_up_boss_get_appointment_types', [FollowUpBossController::class, 'getAppointmentTypes']);
Route::post('follow_up_boss_get_appointment_outcomes', [FollowUpBossController::class, 'getAppointmentOutcomes']);
Route::post('follow_up_boss_get_deal_stages', [FollowUpBossController::class, 'getDealStages']);
Route::post('follow_up_boss_get_email_campaigns', [FollowUpBossController::class, 'getEmailCampaigns']);
Route::post('follow_up_boss_get_teams', [FollowUpBossController::class, 'getTeams']);
Route::post('follow_up_boss_get_groups', [FollowUpBossController::class, 'getGroups']);
Route::post('follow_up_boss_get_custom_fields', [FollowUpBossController::class, 'getCustomFields']);
