<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\BrilliantDirectories\BrilliantDirectoriesHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('brilliant_directories_get_membership_plans', [BrilliantDirectoriesHelper::class, 'getMembershipPlans']);
Route::post('brilliant_directories_get_top_categories', [BrilliantDirectoriesHelper::class, 'getTopCategories']);
Route::post('brilliant_directories_get_post_types', [BrilliantDirectoriesHelper::class, 'getPostTypes']);
