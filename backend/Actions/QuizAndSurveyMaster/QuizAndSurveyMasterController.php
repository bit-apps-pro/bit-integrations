<?php

/**
 * Quiz And Survey Master Integration
 */

namespace BitApps\Integrations\Actions\QuizAndSurveyMaster;

use WP_Error;

class QuizAndSurveyMasterController
{
    public static function isExists()
    {
        if (!\defined('QSM_PLUGIN_PATH')) {
            wp_send_json_error(
                __(
                    'Quiz And Survey Master is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function quizAndSurveyMasterAuthorize()
    {
        self::isExists();

        wp_send_json_success(true);
    }

    public function refreshThemes()
    {
        self::isExists();

        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery -- QSM keeps themes in a custom table with no API
        $rows = $wpdb->get_results("SELECT id, theme_name FROM {$wpdb->prefix}mlw_themes");

        $themes = array_map(
            function ($theme) {
                return (object) [
                    'value' => (string) $theme->id,
                    'label' => (string) $theme->theme_name,
                ];
            },
            $rows ?: []
        );

        wp_send_json_success(['themes' => $themes], 200);
    }

    public function refreshQuestionTypes()
    {
        self::isExists();

        global $mlwQuizMasterNext;

        $questionTypes = [];

        if (isset($mlwQuizMasterNext->pluginHelper->question_types)) {
            foreach ($mlwQuizMasterNext->pluginHelper->question_types as $slug => $type) {
                $questionTypes[] = (object) [
                    'value' => (string) $slug,
                    'label' => (string) ($type['name'] ?? $slug),
                ];
            }
        }

        wp_send_json_success(['questionTypes' => $questionTypes], 200);
    }

    public function execute($integrationData, $fieldValues)
    {
        $integrationDetails = $integrationData->flow_details;
        $integId = $integrationData->id;
        $fieldMap = $integrationDetails->field_map;
        $utilities = isset($integrationDetails->utilities) ? $integrationDetails->utilities : [];

        if (empty($fieldMap)) {
            return new WP_Error('field_map_empty', __('Field map is empty', 'bit-integrations'));
        }

        $recordApiHelper = new RecordApiHelper($integrationDetails, $integId);

        return $recordApiHelper->execute($fieldValues, $fieldMap, $utilities);
    }
}
