<?php

namespace BitApps\Integrations\Actions\WPCourseware;

class WPCoursewareHelper
{
    public static function WPCWCourses()
    {
        if (!is_plugin_active('wp-courseware/wp-courseware.php')) {
            wp_send_json_error(__('WP Courseware Plugin is not active or installed', 'bit-integrations'), 400);
        }

        $wpcwCourses = \function_exists('wpcw_get_courses') ? wpcw_get_courses() : [];

        $courses = [(object) [
            'id'    => 'select_all_course',
            'title' => 'All Courses'
        ]];

        foreach ($wpcwCourses as $course) {
            $courses[] = (object) [
                'id'    => $course->course_id,
                'title' => $course->course_title
            ];
        }

        $response['WPCWCourses'] = $courses;
        wp_send_json_success($response, 200);
    }
}
