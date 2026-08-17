<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WPCourseware\WPCoursewareController;
use BitApps\Integrations\Core\Util\Route;

Route::post('wpCourseware_courses', [WPCoursewareController::class, 'WPCWCourses']);
