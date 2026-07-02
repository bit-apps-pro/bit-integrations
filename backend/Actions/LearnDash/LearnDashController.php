<?php

/**
 * LearnDesh Integration
 */

namespace BitApps\Integrations\Actions\LearnDash;

use WP_Error;

/**
 * Provide functionality for LearnDesh integration
 */
class LearnDashController
{
    // private $_integrationID;

    // public function __construct($integrationID)
    // {
    //     $this->_integrationID = $integrationID;
    // }

    public static function pluginActive($option = null)
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';
        if (is_plugin_active('learndash-propanel/learndash_propanel.php')) {
            return $option === 'get_name' ? 'learndash-propanel/learndash_propanel.php' : true;
        } elseif (is_plugin_active('learndash/learndash.php')) {
            return $option === 'get_name' ? 'learndash/learndash.php' : true;
        } elseif (is_plugin_active('sfwd-lms/sfwd_lms.php')) {
            return $option === 'get_name' ? 'sfwd-lms/sfwd_lms.php' : true;
        }

        return false;
    }

    public static function getCourses()
    {
        $courses = [];

        $course_query_args = [
            'post_type'      => 'sfwd-courses',
            'post_status'    => 'publish',
            'orderby'        => 'post_title',
            'order'          => 'ASC',
            'posts_per_page' => -1,
        ];

        $courseList = get_posts($course_query_args);

        foreach ($courseList as $key => $val) {
            $courses[] = [
                'course_id'    => $val->ID,
                'course_title' => $val->post_title,
            ];
        }

        return $courses;
    }

    public static function learDashFetchAllGroup()
    {
        $groups = [];
        $group_query_args = [
            'post_type'      => 'groups',
            'post_status'    => 'publish',
            'orderby'        => 'post_title',
            'order'          => 'ASC',
            'posts_per_page' => -1,
        ];

        $groupList = get_posts($group_query_args);

        foreach ($groupList as $key => $val) {
            $groups[] = [
                'group_id'    => $val->ID,
                'group_title' => $val->post_title,
            ];
        }

        return $groups;
    }

    public static function learDashFetchAllCourseOfLesson($requestParams)
    {
        $id = (int) $requestParams->courseId;

        $lessonList = learndash_get_lesson_list($id, ['num' => 0]);
        $lessons = [];

        foreach ($lessonList as $key => $val) {
            $lessons[] = [
                'lesson_id'    => $val->ID,
                'lesson_title' => $val->post_title,
            ];
        }

        wp_send_json_success($lessons);
    }

    public static function getTopicsByLesson($requestParams)
    {
        $course_id = (int) $requestParams->courseId;
        $lesson_id = (int) $requestParams->lessonId;
        $topic_list = learndash_get_topic_list($lesson_id, $course_id);
        $topics = [];

        foreach ($topic_list as $key => $val) {
            $topics[] = [
                'topic_id'    => $val->ID,
                'topic_title' => $val->post_title,
            ];
        }

        wp_send_json_success($topics);
    }

    public static function getQuizes()
    {
        $quizes = [];

        $quiz_query_args = [
            'post_type'      => 'sfwd-quiz',
            'post_status'    => 'publish',
            'orderby'        => 'post_title',
            'order'          => 'ASC',
            'posts_per_page' => -1,
        ];

        $quizList = get_posts($quiz_query_args);

        foreach ($quizList as $key => $val) {
            $quizes[] = [
                'quiz_id'    => $val->ID,
                'quiz_title' => $val->post_title,
            ];
        }

        return $quizes;
    }

    public static function getCoursesUnenroll()
    {
        $courses = [];

        $course_query_args = [
            'post_type'      => 'sfwd-courses',
            'post_status'    => 'publish',
            'orderby'        => 'post_title',
            'order'          => 'ASC',
            'posts_per_page' => -1,
        ];

        $courseList = get_posts($course_query_args);
        $courses[] = [
            'course_id'    => 'any',
            'course_title' => 'All Course',
        ];

        foreach ($courseList as $key => $val) {
            $courses[] = [
                'course_id'    => $val->ID,
                'course_title' => $val->post_title,
            ];
        }

        return $courses;
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        $mainActionGroupLeaderMail = isset($integrationDetails->learnDashConf->mainAction) ? $integrationDetails->learnDashConf->mainAction : '';
        if (!empty($mainActionGroupLeaderMail)) {
            $mainAction = $mainActionGroupLeaderMail;
        }

        // $fieldMap = $integrationDetails->field_map;
        // $defaultDataConf = $integrationDetails->default;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name

            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('module, fields are required for %s api', 'bit-integrations'), 'LearnDash'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $learnDashApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($learnDashApiResponse)) {
            return $learnDashApiResponse;
        }

        return $learnDashApiResponse;
    }
}
