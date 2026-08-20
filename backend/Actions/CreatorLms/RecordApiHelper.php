<?php

/**
 * Creator LMS Record Api
 */

namespace BitApps\Integrations\Actions\CreatorLms;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

class RecordApiHelper
{
    private $_integrationID;

    private $_integrationDetails;

    public function __construct($integrationDetails, $integId)
    {
        $this->_integrationDetails = $integrationDetails;
        $this->_integrationID = $integId;
    }

    public function execute($fieldValues, $fieldMap, $utilities)
    {
        if (!class_exists('CreatorLms') || !\function_exists('crlms_get_course')) {
            return [
                'success' => false,
                'message' => __('Creator LMS is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = $this->generateReqDataFromFieldMap($fieldMap, $fieldValues);
        $mainAction = $this->_integrationDetails->mainAction ?? 'create_student';

        $defaultResponse = [
            'success' => false,
            // translators: %s is replaced with the plugin name "Bit Integrations Pro"
            'message' => wp_sprintf(__('%s plugin is not installed or activated', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_student':
                $response = Hooks::apply(Config::withPrefix('creator_lms_create_student'), $defaultResponse, $fieldData);
                $type = 'student';
                $actionType = 'create_student';

                break;
            case 'update_student_data':
                $response = Hooks::apply(Config::withPrefix('creator_lms_update_student_data'), $defaultResponse, $fieldData);
                $type = 'student';
                $actionType = 'update_student_data';

                break;
            case 'enroll_user_in_course':
                $response = Hooks::apply(Config::withPrefix('creator_lms_enroll_user_in_course'), $defaultResponse, $fieldData);
                $type = 'enrollment';
                $actionType = 'enroll_user_in_course';

                break;
            case 'create_course':
                $response = Hooks::apply(Config::withPrefix('creator_lms_create_course'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'course';
                $actionType = 'create_course';

                break;
            case 'mark_lesson_completed':
                $response = Hooks::apply(Config::withPrefix('creator_lms_mark_lesson_completed'), $defaultResponse, $fieldData);
                $type = 'lesson';
                $actionType = 'mark_lesson_completed';

                break;
            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];
                $type = 'CreatorLms';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->creatorLmsField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
