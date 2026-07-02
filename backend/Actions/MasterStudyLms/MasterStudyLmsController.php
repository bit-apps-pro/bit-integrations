<?php

namespace BitApps\Integrations\Actions\MasterStudyLms;

use WP_Error;

class MasterStudyLmsController
{
    public static function pluginActive()
    {
        include_once ABSPATH . 'wp-admin/includes/plugin.php';

        return (bool) (
            is_plugin_active('masterstudy-lms-learning-management-system/masterstudy-lms-learning-management-system.php')
        || is_plugin_active('masterstudy-lms-learning-management-system-pro/masterstudy-lms-learning-management-system-pro.php')
        );
    }

    public static function getAllCourse()
    {
        if (self::pluginActive()) {
            $courses = get_posts([
                'post_type'      => 'stm-courses',
                'post_status'    => 'publish',
                'posts_per_page' => -1,
            ]);
            $courseList = [];
            foreach ($courses as $course) {
                $courseList[] = [
                    'ID'         => $course->ID,
                    'post_title' => $course->post_title,
                ];
            }
            wp_send_json_success($courseList, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'MasterStudyLms'));
    }

    public static function getAllLesson($queryPrarms)
    {
        $courseId = $queryPrarms->courseId;
        if (self::pluginActive()) {
            $allLesson = MasterStudyLmsHelper::getLessonByCourse($courseId);
            wp_send_json_success($allLesson, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'MasterStudyLms'));
    }

    public static function getAllQuizByCourse($queryPrarms)
    {
        $courseId = $queryPrarms->courseId;
        if (self::pluginActive()) {
            $allQuiz = MasterStudyLmsHelper::getQuizByCourse($courseId);
            wp_send_json_success($allQuiz, 200);
        }
        // translators: %s: Plugin name
        // translators: %s: Placeholder value
        wp_send_json_error(wp_sprintf(__('%s must be activated!', 'bit-integrations'), 'MasterStudyLms'));
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $mainAction = $integrationDetails->mainAction;
        if (
            empty($integId)
            || empty($mainAction)
        ) {
            // translators: %s: Integration name
            // translators: %s: Placeholder value
            return new WP_Error('REQ_FIELD_EMPTY', wp_sprintf(__('Some important info are missing those are required for %s', 'bit-integrations'), 'MasterStudyLms'));
        }
        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);
        $MasterStudyLmsApiResponse = $recordApiHelper->execute(
            $mainAction,
            $fieldValues,
            $integrationDetails,
            $integrationData
        );

        if (is_wp_error($MasterStudyLmsApiResponse)) {
            return $MasterStudyLmsApiResponse;
        }

        return $MasterStudyLmsApiResponse;
    }
}
