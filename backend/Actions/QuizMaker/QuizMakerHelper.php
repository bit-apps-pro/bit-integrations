<?php

namespace BitApps\Integrations\Actions\QuizMaker;

class QuizMakerHelper
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

    private static function rowOptions($suffix, $labelColumn)
    {
        global $wpdb;

        $table = $wpdb->prefix . 'aysquiz_' . $suffix;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.PreparedSQL.InterpolatedNotPrepared, PluginCheck.Security.DirectDB.UnescapedDBParameter -- Quiz Maker keeps its data in custom tables; table and column are fixed strings from this class
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
