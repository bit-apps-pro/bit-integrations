<?php

/**
 * Quiz Maker Integration
 */

namespace BitApps\Integrations\Actions\QuizMaker;

use WP_Error;

class QuizMakerController
{
    public static function isExists()
    {
        if (!\defined('AYS_QUIZ_VERSION')) {
            wp_send_json_error(
                __(
                    'Quiz Maker is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public static function quizMakerAuthorize()
    {
        self::isExists();
        wp_send_json_success(true);
    }

    public function refreshQuizCategories()
    {
        self::isExists();

        $response['quizCategories'] = self::rowOptions('quizcategories', 'title');

        wp_send_json_success($response, 200);
    }

    public function refreshQuestionCategories()
    {
        self::isExists();

        $response['questionCategories'] = self::rowOptions('categories', 'title');

        wp_send_json_success($response, 200);
    }

    public function refreshQuestions()
    {
        self::isExists();

        $response['questions'] = self::rowOptions('questions', 'question_title');

        wp_send_json_success($response, 200);
    }

    public function refreshUsers()
    {
        self::isExists();

        $users = array_map(
            function ($user) {
                return (object) [
                    'value' => (string) $user->ID,
                    'label' => $user->display_name . ' (' . $user->user_email . ')',
                ];
            },
            get_users(['fields' => ['ID', 'display_name', 'user_email']])
        );

        $response['users'] = $users;

        wp_send_json_success($response, 200);
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

    /**
     * Dropdown options read from one of Quiz Maker's own tables.
     *
     * @param string $suffix      table suffix after the `aysquiz_` prefix
     * @param string $labelColumn
     *
     * @return array
     */
    private static function rowOptions($suffix, $labelColumn)
    {
        global $wpdb;

        $table = $wpdb->prefix . 'aysquiz_' . $suffix;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery -- Quiz Maker keeps its data in custom tables
        $rows = $wpdb->get_results("SELECT id, `{$labelColumn}` AS label FROM `{$table}` ORDER BY id DESC");

        return array_map(
            function ($row) {
                $label = wp_strip_all_tags((string) $row->label);

                return (object) [
                    'value' => (string) $row->id,
                    'label' => $label !== '' ? $label : '#' . $row->id,
                ];
            },
            $rows ?? []
        );
    }
}
