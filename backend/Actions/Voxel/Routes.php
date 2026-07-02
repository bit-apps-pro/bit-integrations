<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Voxel\VoxelController;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_voxel_post_types', [VoxelController::class, 'getPostTypes']);
Route::post('get_voxel_post_fields', [VoxelController::class, 'getPostFields']);
Route::post('get_voxel_posts', [VoxelController::class, 'getPosts']);
