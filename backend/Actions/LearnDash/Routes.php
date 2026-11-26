<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\LearnDash\LearnDashHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('learDash_fetch_all_course', [LearnDashHelper::class, 'getCourses']);
Route::post('learDash_fetch_all_group', [LearnDashHelper::class, 'learDashFetchAllGroup']);
Route::post('learDash_fetch_all_course_of_lesson', [LearnDashHelper::class, 'learDashFetchAllCourseOfLesson']);
Route::post('learDash_fetch_all_topic_of_lesson', [LearnDashHelper::class, 'getTopicsByLesson']);
Route::post('learDash_fetch_all_quiz', [LearnDashHelper::class, 'getQuizes']);
Route::post('learDash_fetch_all_course_unenroll', [LearnDashHelper::class, 'getCoursesUnenroll']);
