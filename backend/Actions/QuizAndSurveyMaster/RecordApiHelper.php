<?php

/**
 * Quiz And Survey Master Record Api
 */

namespace BitApps\Integrations\Actions\QuizAndSurveyMaster;

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
        if (!\defined('QSM_PLUGIN_PATH')) {
            return [
                'success' => false,
                'message' => __('Quiz And Survey Master is not installed or activated', 'bit-integrations')
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
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_create_quiz'), $defaultResponse, $fieldData, $utilities);
                $type = 'quiz';

                break;

            case 'update_quiz_name':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_update_quiz_name'), $defaultResponse, $fieldData);
                $type = 'quiz';

                break;

            case 'duplicate_quiz':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_duplicate_quiz'), $defaultResponse, $fieldData, $utilities);
                $type = 'quiz';

                break;

            case 'delete_quiz':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_delete_quiz'), $defaultResponse, $fieldData, $utilities);
                $type = 'quiz';

                break;

            case 'create_question':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_create_question'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'question';

                break;

            case 'update_question':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_update_question'), $defaultResponse, $fieldData, $utilities, $this->_integrationDetails);
                $type = 'question';

                break;

            case 'delete_question':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_delete_question'), $defaultResponse, $fieldData);
                $type = 'question';

                break;

            case 'delete_result':
                $response = Hooks::apply(Config::withPrefix('quiz_and_survey_master_delete_result'), $defaultResponse, $fieldData, $utilities);
                $type = 'result';

                break;

            default:
                $response = $defaultResponse;
                $type = 'quiz';

                break;
        }

        $responseType = isset($response['success']) && $response['success'] ? 'success' : 'error';

        LogHandler::save($this->_integrationID, ['type' => $type, 'type_name' => $mainAction], $responseType, $response);

        return $response;
    }

    protected static function generateReqDataFromFieldMap($fieldMap, $fieldValues)
    {
        $dataFinal = [];

        foreach ($fieldMap as $item) {
            $triggerValue = $item->formField;
            $actionValue = $item->quizAndSurveyMasterField;

            if (empty($actionValue)) {
                continue;
            }

            $dataFinal[$actionValue] = $triggerValue === 'custom' && isset($item->customValue)
                ? Common::replaceFieldWithValue($item->customValue, $fieldValues)
                : $fieldValues[$triggerValue] ?? '';
        }

        return $dataFinal;
    }
}
