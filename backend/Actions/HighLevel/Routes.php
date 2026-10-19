<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\HighLevel\HighLevelHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('get_highLevel_contact_custom_fields', [HighLevelHelper::class, 'getCustomFields']);
Route::post('high_level_contact_tags', [HighLevelHelper::class, 'getAllTags']);
Route::post('get_highLevel_contacts', [HighLevelHelper::class, 'getContacts']);
Route::post('get_highLevel_users', [HighLevelHelper::class, 'getUsers']);
Route::post('get_highLevel_tasks', [HighLevelHelper::class, 'getHLTasks']);
Route::post('get_highLevel_pipelines', [HighLevelHelper::class, 'getPipelines']);
Route::post('get_highLevel_opportunities', [HighLevelHelper::class, 'getOpportunities']);
