<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\JetEngine\JetEngineHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('jetEngine_menu_positions', [JetEngineHelper::class, 'getMenuPosition']);
Route::post('jetEngine_menu_icons', [JetEngineHelper::class, 'getMenuIcons']);
Route::post('jetEngine_supports', [JetEngineHelper::class, 'getSupports']);
Route::post('jetEngine_tax_post_types', [JetEngineHelper::class, 'getTaxPostTypes']);
Route::post('jetEngine_relation_types', [JetEngineHelper::class, 'getRelationTypes']);
Route::post('jetEngine_cpt_list', [JetEngineHelper::class, 'getCPTList']);
Route::post('jetEngine_cct_list', [JetEngineHelper::class, 'getCCTList']);
Route::post('jetEngine_tax_list', [JetEngineHelper::class, 'getTaxList']);
Route::post('jetEngine_relation_list', [JetEngineHelper::class, 'getRelationList']);
