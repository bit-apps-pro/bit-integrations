<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BrilliantDirectories\BrilliantDirectoriesController;
use BitApps\Integrations\Core\Util\Route;

Route::post('brilliant_directories_get_membership_plans', [BrilliantDirectoriesController::class, 'getMembershipPlans']);
Route::post('brilliant_directories_get_top_categories', [BrilliantDirectoriesController::class, 'getTopCategories']);
Route::post('brilliant_directories_get_post_types', [BrilliantDirectoriesController::class, 'getPostTypes']);
