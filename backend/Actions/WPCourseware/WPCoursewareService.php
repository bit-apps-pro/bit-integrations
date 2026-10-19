<?php

namespace BitApps\Integrations\Actions\WPCourseware;

use BitApps\Integrations\Log\LogHandler;

class WPCoursewareService
{
    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

    public function enrollAndUnroll($action, $course, $userId, $allCourse)
    {
        $type = $action === 'enroll' ? 'add' : 'sync';
        $courses = [];
        $tempCourses = [];
        $courseArray = \in_array('select_all_course', $course) && !empty($allCourse) ? $allCourse : $course;
        $wpcwCourses = $action === 'enroll'
            ? (\function_exists('wpcw_get_courses') ? wpcw_get_courses() : [])
            : (\function_exists('WPCW_users_getUserCourseList') ? WPCW_users_getUserCourseList($userId) : []);

        if (empty($wpcwCourses)) {
            return ['success' => false, 'messages' => __('No Course Available!', 'bit-integrations')];
        }

        foreach ($wpcwCourses as $tempCourse) {
            $tempCourses[$tempCourse->course_id] = $tempCourse->course_id;
        }

        if ($action === 'enroll') {
            foreach ($courseArray as $singleCourse) {
                if ($singleCourse !== 'select_all_course' && \array_key_exists($singleCourse, $tempCourses)) {
                    $courses[$singleCourse] = $singleCourse;
                }
            }
        } elseif ($action === 'unroll') {
            $courses = array_diff($tempCourses, $courseArray);
        }

        if (\function_exists('WPCW_courses_syncUserAccess')) {
            WPCW_courses_syncUserAccess($userId, $courses, $type);

            return ['success' => true, 'messages' => __('Insert successfully!', 'bit-integrations')];
        }

        return ['success' => false, 'messages' => __('Somethings wrong, please try again!', 'bit-integrations')];
    }

    public function execute($action, $course, $userId, $allCourse)
    {
        $recordApiResponse = $this->enrollAndUnroll($action, $course, $userId, $allCourse);

        if (isset($recordApiResponse['success']) && $recordApiResponse['success']) {
            LogHandler::save($this->integrationID, ['type' => 'record', 'type_name' => 'insert'], 'success', $recordApiResponse);
        } else {
            LogHandler::save($this->integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', $recordApiResponse);
        }

        return $recordApiResponse;
    }
}
