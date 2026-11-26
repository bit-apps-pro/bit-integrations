<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\Voxel\VoxelHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_voxel_post_types', [VoxelHelper::class, 'getPostTypes']);
Route::post('get_voxel_post_fields', [VoxelHelper::class, 'getPostFields']);
Route::post('get_voxel_posts', [VoxelHelper::class, 'getPosts']);
