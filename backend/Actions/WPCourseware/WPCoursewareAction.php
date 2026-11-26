<?php

namespace BitApps\Integrations\Actions\WPCourseware;

use BitApps\Integrations\Core\Util\ActionUser;
use BitApps\Integrations\Log\LogHandler;
use WP_Error;

class WPCoursewareAction
{
    private $integrationID;

    public function __construct($integrationID)
    {
        $this->integrationID = $integrationID;
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

        $recordApiHelper = new WPCoursewareService($this->integrationID);

        return $recordApiHelper->execute($action, $course, $userId, $allCourse);
    }
}
