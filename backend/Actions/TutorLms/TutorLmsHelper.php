<?php

namespace BitApps\Integrations\Actions\TutorLms;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Core\Util\Post;

class TutorLmsHelper
{
    public static function getAllLesson()
    {
        if (!\function_exists('tutor')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'Tutor LMS'));
        }

        $lessons = [];

        $lessonList = Post::all([
            'post_type'   => 'lesson',
            'post_status' => 'publish',
            'numberposts' => -1
        ]);

        foreach ($lessonList as $key => $val) {
            $lessons[] = [
                'lessonId'    => $val->ID,
                'lessonTitle' => $val->post_title,
            ];
        }
        wp_send_json_success($lessons, 200);
    }

    public static function getAllCourse($queryParams)
    {
        $action = $queryParams->type;
        if (!\function_exists('tutor')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'Tutor LMS'));
        }

        $courseList = Post::all([
            'post_type'   => 'courses',
            'post_status' => 'publish',
            'numberposts' => -1
        ]);

        if ($action !== 'complete-course' && $action !== 'reset-course') {
            $courses[] = [
                'courseId'    => 'all-course',
                'courseTitle' => __('All Course', 'bit-integrations'),
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
