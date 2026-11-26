<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\AcademyLms\AcademyLmsHelper;
use BitApps\Integrations\Core\Util\Route;

Route::get('academy_lms_all_course', [AcademyLmsHelper::class, 'getAllCourse']);
Route::get('academy_lms_all_lesson', [AcademyLmsHelper::class, 'getAllLesson']);
