<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\SenseiLMS\SenseiLMSHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('refresh_sensei_lms_courses', [SenseiLMSHelper::class, 'refreshCourses']);
Route::post('refresh_sensei_lms_lessons', [SenseiLMSHelper::class, 'refreshLessons']);
Route::post('refresh_sensei_lms_quizzes', [SenseiLMSHelper::class, 'refreshQuizzes']);
