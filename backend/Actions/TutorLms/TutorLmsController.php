<?php

namespace BitApps\Integrations\Actions\TutorLms;

if (! defined('ABSPATH')) {
    exit;
}

use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Tutor LMS integration
 */
class TutorLmsController
{
    private $_integrationID;

    public function __construct($integrationID)
    {
        $this->_integrationID = $integrationID;
    }

    public static function getAllLesson()
    {
        if (!\function_exists('tutor')) {
            // translators: %s: Plugin name
            wp_send_json_error(wp_sprintf(__('%s is not installed or activated.', 'bit-integrations'), 'Tutor LMS'));
        }

        $lessons = [];

        $lessonList = get_posts([
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

        $courseList = get_posts([
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
                tutor_utils()->do_enroll($course_id, false, $user_id);
                remove_filter('is_course_purchasable', '__return_false', 10);
            }

            return __('course enrolled', 'bit-integrations');
        }
        foreach ($course_ids as $course_id) {
            tutor_utils()->cancel_course_enrol($course_id, $user_id);
        }

        return __('course unenrolled', 'bit-integrations');
    }

    public static function completeLesson($selectedLesson)
    {
        $user_id = get_current_user_id();
        $lesson_id = $selectedLesson[0];
        tutils()->mark_lesson_complete($lesson_id, $user_id);

        return __('Lesson completed', 'bit-integrations');
    }

    public static function completeCourse($selectedCourse)
    {
        $user_id = get_current_user_id();
        $course_id = $selectedCourse[0];

        if (!tutils()->is_completed_course($course_id, $user_id)) {
            $lessons = tutils()->get_lesson($course_id, -1);
            if (\count($lessons)) {
                foreach ($lessons as $lesson) {
                    tutils()->mark_lesson_complete($lesson->ID, $user_id);
                }
            }
        }

        $completed = self::completedCourse($course_id, $user_id);

        return __('Course Completed', 'bit-integrations');
    }

    public static function resetCourse($selectedCourse)
    {
        global $wpdb;
        $user_id = get_current_user_id();
        $course_id = $selectedCourse[0];

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for TutorLMS reset lookup.
        $completedLessonIds = $wpdb->get_col($wpdb->prepare("select post_id from {$wpdb->postmeta} where meta_key = '_tutor_course_id_for_lesson' AND meta_value = %d", $course_id));

        if (\is_array($completedLessonIds) && \count($completedLessonIds)) {
            $lessonMetaIds = [];
            foreach ($completedLessonIds as $lesson_id) {
                $lesson_id = absint($lesson_id);
                $lessonMetaIds[] = '_tutor_completed_lesson_id_' . $lesson_id;
            }

            // Create placeholders for IN clause
            $placeholders = implode(', ', array_fill(0, \count($lessonMetaIds), '%s'));
            $query = \sprintf(
                "DELETE from {$wpdb->usermeta} WHERE user_id = %%d AND meta_key IN (%s)",
                $placeholders
            );
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $wpdb->query(
                $wpdb->prepare(
                    $query, // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
                    array_merge([$user_id], $lessonMetaIds)
                )
            );
        }

        $courseContents = tutils()->get_course_contents_by_id($course_id);
        $cntContents = tutils()->count($courseContents);
        if ($cntContents) {
            foreach ($courseContents as $content) {
                if ('tutor_quiz' === $content->post_type) {
                    $quiz_id = $content->ID;
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for TutorLMS quiz cleanup
                    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->tutor_quiz_attempts} WHERE quiz_id = %d AND user_id = %d", $quiz_id, $user_id));
                } elseif ('tutor_assignments' === $content->post_type) {
                    $assignment_id = $content->ID;
                    // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
                    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->comments} WHERE comment_type = 'tutor_assignment' AND user_id = %d AND comment_post_ID = %d", $user_id, $assignment_id));
                }
            }
        }

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
        $wpdb->query($wpdb->prepare("DELETE from {$wpdb->comments} WHERE comment_agent = 'TutorLMSPlugin' AND comment_type = 'course_completed' AND comment_post_ID = %d AND user_id = %d", $course_id, $user_id));

        return __('Course progress reseted', 'bit-integrations');
    }

    public static function completedCourse($course_id, $user_id)
    {
        global $wpdb;
        do_action('tutor_course_complete_before', $course_id);

        $date = gmdate('Y-m-d H:i:s', tutor_time());

        $hash = substr(md5(wp_generate_password(32) . $date . $course_id . $user_id), 0, 16);
        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct query needed for hash validation
        $has_unique_hash = $wpdb->get_var($wpdb->prepare("SELECT COUNT(comment_ID) from {$wpdb->comments} WHERE comment_agent = 'TutorLMSPlugin' AND comment_type = 'course_completed' AND comment_content = %s", $hash));

        while ((int) $has_unique_hash > 0) {
            $hash = substr(md5(wp_generate_password(32) . $date . $course_id . $user_id), 0, 16);
            // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
            $has_unique_hash = $wpdb->get_var($wpdb->prepare("SELECT COUNT(comment_ID) from {$wpdb->comments} WHERE comment_agent = 'TutorLMSPlugin' AND comment_type = 'course_completed' AND comment_content = %s", $hash));
        }

        $data = [
            'comment_post_ID'  => $course_id,
            'comment_author'   => $user_id,
            'comment_date'     => $date,
            'comment_date_gmt' => get_gmt_from_date($date),
            'comment_content'  => $hash,
            'comment_approved' => 'approved',
            'comment_agent'    => 'TutorLMSPlugin',
            'comment_type'     => 'course_completed',
            'user_id'          => $user_id,
        ];

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Direct insert required for course completion
        $wpdb->insert($wpdb->comments, $data);

        do_action('tutor_course_complete_after', $course_id);

        return true;
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
                } else {
                    $response = self::enrollCourse($selectedCourse, $selectedAllCourse, 'enroll');
                }

                break;
            case 'complete-lesson':
                $selectedLesson = $integrationData->flow_details->selectedLesson;
                $response = self::completeLesson($selectedLesson);

                break;
        }

        if (!isset($response) && $response != []) {
            LogHandler::save($integId, wp_json_encode(['type' => $actionName, 'type_name' => $actionName]), 'error', wp_json_encode($response));
        } else {
            LogHandler::save($integId, wp_json_encode(['type' => $actionName, 'type_name' => $actionName]), 'success', wp_json_encode($response));
        }
    }
}
