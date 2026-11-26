<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\FollowUpBoss\FollowUpBossHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('follow_up_boss_get_users', [FollowUpBossHelper::class, 'getUsers']);
Route::post('follow_up_boss_get_lenders', [FollowUpBossHelper::class, 'getLenders']);
Route::post('follow_up_boss_get_stage_names', [FollowUpBossHelper::class, 'getStageNames']);
Route::post('follow_up_boss_get_stages', [FollowUpBossHelper::class, 'getStages']);
Route::post('follow_up_boss_get_ponds', [FollowUpBossHelper::class, 'getPonds']);
Route::post('follow_up_boss_get_timeframes', [FollowUpBossHelper::class, 'getTimeframes']);
Route::post('follow_up_boss_get_action_plans', [FollowUpBossHelper::class, 'getActionPlans']);
Route::post('follow_up_boss_get_appointment_types', [FollowUpBossHelper::class, 'getAppointmentTypes']);
Route::post('follow_up_boss_get_appointment_outcomes', [FollowUpBossHelper::class, 'getAppointmentOutcomes']);
Route::post('follow_up_boss_get_deal_stages', [FollowUpBossHelper::class, 'getDealStages']);
Route::post('follow_up_boss_get_email_campaigns', [FollowUpBossHelper::class, 'getEmailCampaigns']);
Route::post('follow_up_boss_get_teams', [FollowUpBossHelper::class, 'getTeams']);
Route::post('follow_up_boss_get_groups', [FollowUpBossHelper::class, 'getGroups']);
Route::post('follow_up_boss_get_custom_fields', [FollowUpBossHelper::class, 'getCustomFields']);
