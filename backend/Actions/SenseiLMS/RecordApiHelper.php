<?php

/**
 * Sensei LMS Record Api
 */

namespace BitApps\Integrations\Actions\SenseiLMS;

use BitApps\Integrations\Config;
use BitApps\Integrations\Core\Util\Common;
use BitApps\Integrations\Core\Util\Hooks;
use BitApps\Integrations\Log\LogHandler;

/**
 * Provide functionality for Record insert, update
 */
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
        if (!class_exists('Sensei_Main')) {
            return [
                'success' => false,
                'message' => __('Sensei LMS is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'enroll_user_in_course';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'enroll_user_in_course':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_enroll_user_in_course'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'withdraw_user_from_course':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_withdraw_user_from_course'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'start_course_for_user':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_start_course_for_user'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'complete_course_for_user':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_complete_course_for_user'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'reset_course_for_user':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_reset_course_for_user'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'start_lesson_for_user':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_start_lesson_for_user'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'update_lesson_status':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_update_lesson_status'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'reset_lesson_for_user':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_reset_lesson_for_user'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'grade_quiz':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_grade_quiz'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'create_course':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_create_course'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'create_lesson':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_create_lesson'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            case 'create_certificate':
                $response = Hooks::apply(Config::withPrefix('sensei_lms_create_certificate'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);

                break;
            default:
                $response = ['success' => false, 'message' => __('Invalid action', 'bit-integrations')];

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => 'SenseiLMS', 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    private function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            if (empty($item->senseiLMSField)) {
                continue;
            }

            $triggerValue = $item->formField;
            $actionValue = $item->senseiLMSField;

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
