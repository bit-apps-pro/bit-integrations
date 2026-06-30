<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SenseiLMS\SenseiLMSController;
use BitApps\Integrations\Core\Util\Route;

Route::post('sensei_lms_authorize', [SenseiLMSController::class, 'senseiLMSAuthorize']);
Route::post('refresh_sensei_lms_courses', [SenseiLMSController::class, 'refreshCourses']);
Route::post('refresh_sensei_lms_lessons', [SenseiLMSController::class, 'refreshLessons']);
Route::post('refresh_sensei_lms_quizzes', [SenseiLMSController::class, 'refreshQuizzes']);
