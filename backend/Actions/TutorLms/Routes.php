<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TutorLms\TutorLmsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::get('tutor_all_course', [TutorLmsHelper::class, 'getAllCourse']);
Route::get('tutor_all_lesson', [TutorLmsHelper::class, 'getAllLesson']);
