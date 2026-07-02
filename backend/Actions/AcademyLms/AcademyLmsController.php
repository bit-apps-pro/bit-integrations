<?php

namespace BitApps\Integrations\Actions\AcademyLms;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Academy Lms integration
 */
class AcademyLmsController
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

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

        $courseList = get_posts([
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

    public static function enrollCourse($selectedCourse, $selectedAllCourse, $type)
    {
        $course_ids = [];

        if (\count($selectedAllCourse)) {
            foreach ($selectedAllCourse as $course) {
                if ($course->courseId !== 'all-course') {
                    $course_ids[] = $course->courseId;
                }
            }
        } else {
            $course_ids = $selectedCourse;
        }

        $user_id = get_current_user_id();
        if (!\count($course_ids)) {
            return;
        }

        if ($type === 'enroll') {
            foreach ($course_ids as $course_id) {
                add_filter('is_course_purchasable', '__return_false', 10);
                \Academy\Helper::do_enroll($course_id, $user_id);
                remove_filter('is_course_purchasable', '__return_false', 10);
            }

            return 'course enrolled';
        }
        foreach ($course_ids as $course_id) {
            \Academy\Helper::cancel_course_enroll($course_id, $user_id);
        }

        return 'course unenrolled';
    }

    public static function completeLesson($selectedCourse, $selectedLesson)
    {
        $user_id = get_current_user_id();
        $topic_id = $selectedLesson[0];
        $course_id = $selectedCourse[0];
        $topic_type = 'lesson';

        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using Academy LMS's own hook for compatibility
        do_action('academy/frontend/before_mark_topic_complete', $topic_type, $course_id, $topic_id, $user_id);

        $option_name = 'academy_course_' . $course_id . '_completed_topics';
        $saved_topics_lists = (array) json_decode(get_user_meta($user_id, $option_name, true), true);

        if (isset($saved_topics_lists[$topic_type][$topic_id])) {
            unset($saved_topics_lists[$topic_type][$topic_id]);
        } else {
            $saved_topics_lists[$topic_type][$topic_id] = \Academy\Helper::get_time();
        }
        $saved_topics_lists = wp_json_encode($saved_topics_lists);
        update_user_meta($user_id, $option_name, $saved_topics_lists);
        // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- Using Academy LMS's own hook for compatibility
        do_action('academy/frontend/after_mark_topic_complete', $topic_type, $course_id, $topic_id, $user_id);

        return 'Lesson Completed';
    }

    public static function completeCourse($selectedCourse)
    {
        $user_id = get_current_user_id();
        $course_id = $selectedCourse[0];

        global $wpdb;
        do_action('academy/admin/course_complete_before', $course_id);
        $date = gmdate('Y-m-d H:i:s', \Academy\Helper::get_time());

        // hash is unique.
        do {
            $hash = substr(md5(wp_generate_password(32) . $date . $course_id . $user_id), 0, 16);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for hash validation
            $hasHash = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(comment_ID) from {$wpdb->comments} 
				WHERE comment_agent = 'academy' AND comment_type = 'course_completed' AND comment_content = %s ",
                    $hash
                )
            );
        } while ($hasHash > 0);

        $data = [
            'comment_post_ID'  => $course_id,
            'comment_author'   => $user_id,
            'comment_date'     => $date,
            'comment_date_gmt' => get_gmt_from_date($date),
            'comment_content'  => $hash,
            'comment_approved' => 'approved',
            'comment_agent'    => 'academy',
            'comment_type'     => 'course_completed',
            'user_id'          => $user_id,
        ];
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct insert required for course completion
        $is_complete = $wpdb->insert($wpdb->comments, $data);

        do_action('academy/admin/course_complete_after', $course_id, $user_id);

        if ($is_complete) {
            return 'Course Completed.';
        }
    }

    public static function resetCourse($selectedCourse)
    {
        global $wpdb;
        $user_id = get_current_user_id();
        $course_id = $selectedCourse[0];
        $complete_topics = "academy_course_{$course_id}_completed_topics";

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct queries needed for course reset
        $wpdb->query($wpdb->prepare("DELETE from {$wpdb->postmeta} WHERE post_id = %d AND meta_key = %s", $course_id, 'academy_course_curriculum'));
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query($wpdb->prepare("DELETE from {$wpdb->usermeta} WHERE user_id = %d AND meta_key = %s", $user_id, $complete_topics));
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query($wpdb->prepare("DELETE from {$wpdb->posts} WHERE post_author = %d AND post_parent = %d AND post_type = %s ", $user_id, $course_id, 'academy_enrolled'));

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for AcademyLMS reset lookup.
        $QuizIds = $wpdb->get_col($wpdb->prepare("SELECT quiz_id FROM {$wpdb->prefix}academy_quiz_attempts WHERE user_id = %d AND course_id = %d", $user_id, $course_id));

        if (!empty($QuizIds)) {
            $placeholders = implode(',', array_fill(0, \count($QuizIds), '%d'));
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->query($wpdb->prepare("DELETE from {$wpdb->prefix}academy_quiz_attempts WHERE user_id = %d AND course_id = %d", $user_id, $course_id));
            $query_format = \sprintf("DELETE from {$wpdb->prefix}academy_quiz_attempt_answers WHERE user_id = %%d AND quiz_id in ({$placeholders})");
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Dynamic IN clause with sprintf for placeholders
            $wpdb->query($wpdb->prepare($query_format, $user_id, ...$QuizIds));
        }
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query($wpdb->prepare("DELETE from {$wpdb->comments} WHERE comment_agent = 'academy' AND comment_type = 'course_completed' AND comment_post_ID = %d AND user_id = %d", $course_id, $user_id));

        return 'Course progress reseted';
    }

    public function execute($integrationData, $fieldValues)
    {
        $integId = $integrationData->id;
        $actionName = $integrationData->flow_details->actionName;
        $response = [];
        switch ($actionName) {
            case 'enroll-course':
            case 'unenroll-course':
            case 'complete-course':
            case 'reset-course':
                $selectedCourse = $integrationData->flow_details->selectedCourse;
                $selectedAllCourse = [];
                if ($actionName !== 'complete-course' && property_exists($integrationData->flow_details, 'selectedAllCourse')) {
                    $selectedAllCourse = $integrationData->flow_details->selectedAllCourse;
                }
                if ($actionName === 'complete-course') {
                    $response = self::completeCourse($selectedCourse);
                } elseif ($actionName === 'reset-course') {
                    $response = self::resetCourse($selectedCourse);
                } elseif ($actionName === 'enroll-course') {
                    $response = self::enrollCourse($selectedCourse, $selectedAllCourse, 'enroll');
                } else {
                    $response = self::enrollCourse($selectedCourse, $selectedAllCourse, 'unenroll');
                }

                break;
            case 'complete-lesson':
                $selectedCourse = $integrationData->flow_details->selectedCourse;
                $selectedLesson = $integrationData->flow_details->selectedLesson;
                $response = self::completeLesson($selectedCourse, $selectedLesson);

                break;
        }

        if (!isset($response) && $response != []) {
            LogHandler::save($integId, wp_json_encode(['type' => $actionName, 'type_name' => $actionName]), 'error', wp_json_encode($response));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => $actionName, 'type_name' => $actionName]), 'success', wp_json_encode($response));
        }
    }
}
