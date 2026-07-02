<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LifterLms\LifterLmsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('lifterLms_fetch_all_lesson', [LifterLmsController::class, 'getAllLesson']);
Route::post('lifterLms_fetch_all_section', [LifterLmsController::class, 'getAllSection']);
Route::post('lifterLms_fetch_all_course', [LifterLmsController::class, 'getAllLifterLmsCourse']);
Route::post('lifterLms_fetch_all_membership', [LifterLmsController::class, 'getAllLifterLmsMembership']);
