<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\MasterStudyLms\MasterStudyLmsController;
use BitApps\Integrations\Core\Util\Route;

Route::post('mslms_fetch_all_course', [MasterStudyLmsController::class, 'getAllCourse']);
Route::post('msLms_fetch_all_lesson', [MasterStudyLmsController::class, 'getAllLesson']);
Route::post('msLms_fetch_all_quiz', [MasterStudyLmsController::class, 'getAllQuizByCourse']);
