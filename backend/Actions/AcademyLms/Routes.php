<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\AcademyLms\AcademyLmsController;
use BitApps\Integrations\Core\Util\Route;

Route::get('academy_lms_all_course', [AcademyLmsController::class, 'getAllCourse']);
Route::get('academy_lms_all_lesson', [AcademyLmsController::class, 'getAllLesson']);
