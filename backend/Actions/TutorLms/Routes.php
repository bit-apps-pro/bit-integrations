<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\TutorLms\TutorLmsController;
use BitApps\Integrations\Core\Util\Route;

Route::get('tutor_all_course', [TutorLmsController::class, 'getAllCourse']);
Route::get('tutor_all_lesson', [TutorLmsController::class, 'getAllLesson']);
