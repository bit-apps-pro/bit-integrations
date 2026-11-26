<?php

if (!defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Actions\WPCourseware\WPCoursewareHelper;
use BitApps\Integrations\Core\Util\Route;

Route::post('wpCourseware_courses', [WPCoursewareHelper::class, 'WPCWCourses']);
