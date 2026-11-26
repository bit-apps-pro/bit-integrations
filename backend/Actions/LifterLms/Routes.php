<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LifterLms\LifterLmsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('lifterLms_fetch_all_lesson', [LifterLmsHelper::class, 'getAllLesson']);
Route::post('lifterLms_fetch_all_section', [LifterLmsHelper::class, 'getAllSection']);
Route::post('lifterLms_fetch_all_course', [LifterLmsHelper::class, 'getAllLifterLmsCourse']);
Route::post('lifterLms_fetch_all_membership', [LifterLmsHelper::class, 'getAllLifterLmsMembership']);
