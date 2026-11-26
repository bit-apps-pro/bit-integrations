<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\GamiPress\GamiPressHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('gamiPress_fetch_all_rank_type', [GamiPressHelper::class, 'fetchAllRankType']);
Route::post('gamiPress_fetch_all_rank_by_type', [GamiPressHelper::class, 'fetchAllRankBYType']);
Route::post('gamiPress_fetch_all_achievement_type', [GamiPressHelper::class, 'fetchAllAchievementType']);
Route::post('gamiPress_fetch_all_achievement_by_type', [GamiPressHelper::class, 'fetchAllAchievementBYType']);
Route::post('gamiPress_fetch_all_point_type', [GamiPressHelper::class, 'fetchAllPointType']);
