<?php

namespace BitApps\Integrations\Actions\WPCourseware;

use BitApps\Integrations\Core\Util\ActionUser;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class WPCoursewareController
{
    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
    }

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

    public function execute($integrationData, $fieldValues)
    {
        if (!is_plugin_active('wp-courseware/wp-courseware.php')) {
            LogHandler::save($this->integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', __('WP Courseware Plugins not found', 'bit-integrations'));

            return false;
        }

        $integrationDetails = $integrationData->flow_details;

        $userId = ActionUser::resolve($integrationDetails, $fieldValues);

        if (is_wp_error($userId)) {
            LogHandler::save($this->integrationID, ['type' => 'record', 'type_name' => 'insert'], 'error', $userId->get_error_message());

            return $userId;
        }

        $action = $integrationDetails->action;
        $course = $integrationDetails->course;
        $allCourse = isset($integrationDetails->selectedAllCourse) ? $integrationDetails->selectedAllCourse : [];

        if (empty($action) || empty($course)) {
            return new WP_Error('REQ_FIELD_EMPTY', __('Action, Course are required for WP Courseware api', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($this->integrationID);

        return $recordApiHelper->execute($action, $course, $userId, $allCourse);
    }
}
