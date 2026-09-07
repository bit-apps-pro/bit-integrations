<?php

/**
 * Quiz Maker Record Api
 */

namespace BitApps\Integrations\Actions\QuizMaker;

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
        if (!\defined('AYS_QUIZ_VERSION')) {
            return [
                'success' => false,
                'message' => __('Quiz Maker is not installed or activated', 'bit-integrations')
            ];
        }

        $fieldData = static::generateReqDataFromFieldMap($fieldMap, $fieldValues);

        $mainAction = $this->_integrationDetails->mainAction ?? 'create_quiz';

        $defaultResponse = [
            'success' => false,
            // translators: %s: Plugin name
            'message' => wp_sprintf(__('%s plugin is not installed or activate', 'bit-integrations'), 'Bit Integrations Pro')
        ];

        switch ($mainAction) {
            case 'create_quiz':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_quiz'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'quiz';
                $actionType = 'create_quiz';

                break;

            case 'update_quiz':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_update_quiz'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'quiz';
                $actionType = 'update_quiz';

                break;

            case 'change_quiz_status':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_change_quiz_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'quiz';
                $actionType = 'change_quiz_status';

                break;

            case 'delete_quiz':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_quiz'), $defaultResponse, $fieldData);
                $type = 'quiz';
                $actionType = 'delete_quiz';

                break;

            case 'create_question':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_question'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'question';
                $actionType = 'create_question';

                break;

            case 'update_question':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_update_question'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'question';
                $actionType = 'update_question';

                break;

            case 'change_question_status':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_change_question_status'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'question';
                $actionType = 'change_question_status';

                break;

            case 'delete_question':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_question'), $defaultResponse, $fieldData);
                $type = 'question';
                $actionType = 'delete_question';

                break;

            case 'create_quiz_category':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_quiz_category'), $defaultResponse, $fieldData, $utilities);
                $type = 'quiz_category';
                $actionType = 'create_quiz_category';

                break;

            case 'update_quiz_category':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_update_quiz_category'), $defaultResponse, $fieldData, $utilities);
                $type = 'quiz_category';
                $actionType = 'update_quiz_category';

                break;

            case 'delete_quiz_category':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_quiz_category'), $defaultResponse, $fieldData);
                $type = 'quiz_category';
                $actionType = 'delete_quiz_category';

                break;

            case 'create_question_category':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_question_category'), $defaultResponse, $fieldData, $utilities);
                $type = 'question_category';
                $actionType = 'create_question_category';

                break;

            case 'update_question_category':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_update_question_category'), $defaultResponse, $fieldData, $utilities);
                $type = 'question_category';
                $actionType = 'update_question_category';

                break;

            case 'delete_question_category':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_question_category'), $defaultResponse, $fieldData);
                $type = 'question_category';
                $actionType = 'delete_question_category';

                break;

            case 'create_result':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_result'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'result';
                $actionType = 'create_result';

                break;

            case 'mark_result_as_read':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_mark_result_as_read'), $defaultResponse, $fieldData);
                $type = 'result';
                $actionType = 'mark_result_as_read';

                break;

            case 'delete_result':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_result'), $defaultResponse, $fieldData);
                $type = 'result';
                $actionType = 'delete_result';

                break;

            case 'create_review':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_review'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'review';
                $actionType = 'create_review';

                break;

            case 'delete_review':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_review'), $defaultResponse, $fieldData);
                $type = 'review';
                $actionType = 'delete_review';

                break;

            case 'create_question_report':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_create_question_report'), $defaultResponse, $fieldData, $this->_integrationDetails);
                $type = 'question_report';
                $actionType = 'create_question_report';

                break;

            case 'resolve_question_report':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_resolve_question_report'), $defaultResponse, $fieldData);
                $type = 'question_report';
                $actionType = 'resolve_question_report';

                break;

            case 'delete_question_report':
                $response = Hooks::apply(Config::withPrefix('quiz_maker_delete_question_report'), $defaultResponse, $fieldData);
                $type = 'question_report';
                $actionType = 'delete_question_report';

                break;

            default:
                $response = [
                    'success' => false,
                    'message' => __('Invalid action', 'bit-integrations')
                ];
                $type = 'QuizMaker';
                $actionType = 'unknown';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';
        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $actionType], $responseType, $response);

        return $response;
    }

    private static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];
        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->quizMakerField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue) ? Common::replaceFieldWithValue($item->customValue, $fieldValues) : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
