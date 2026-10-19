<?php

namespace BitApps\Integrations\Actions\AcademyLms;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Post;

class AcademyLmsHelper
{
    public static function getAllLesson()
    {
        if (!class_exists('Academy')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Academy Lms'));
        }

        $lessons = [];

        $lessonList = \Academy\Traits\Lessons::get_lessons();

        foreach ($lessonList as $key => $val) {
            $lessons[] = [
                'lessonId'    => $val->ID,
                'lessonTitle' => $val->lesson_title,
            ];
        }
        wp_send_json_success($lessons, 200);
    }

    public static function getAllCourse($queryParams)
    {
        $action = $queryParams->type;
        if (!class_exists('Academy')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated', 'bit-integrations'), 'Academy Lms'));
        }

        $courseList = Post::all([
            'post_type'   => 'academy_courses',
            'post_status' => 'publish',
            'numberposts' => -1
        ]);

        if ($action !== 'complete-course' && $action !== 'reset-course' && $action !== 'complete-lesson') {
            $courses[] = [
                'courseId'    => 'all-course',
                'courseTitle' => __('All Course', 'bit-integrations')
            ];
        }

        foreach ($courseList as $key => $val) {
            $courses[] = [
                'courseId'    => $val->ID,
                'courseTitle' => $val->post_title,
            ];
        }
        wp_send_json_success($courses, 200);
    }
}
