<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MasterStudyLms\MasterStudyLmsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('mslms_fetch_all_course', [MasterStudyLmsHelper::class, 'getAllCourse']);
Route::post('msLms_fetch_all_lesson', [MasterStudyLmsHelper::class, 'getAllLesson']);
Route::post('msLms_fetch_all_quiz', [MasterStudyLmsHelper::class, 'getAllQuizByCourse']);
