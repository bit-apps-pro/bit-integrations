<?php

namespace BitApps\Integrations\Actions\SenseiLMS;

use BitApps\Integrations\Core\Util\Post;

class SenseiLMSHelper
{
    public static function isExists()
    {
        if (!class_exists('Sensei_Main')) {
            wp_send_json_error(
                __('Sensei LMS is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function refreshCourses()
    {
        self::isExists();

        $response['courses'] = self::postOptions('course');
        wp_send_json_success($response, 200);
    }

    public static function refreshLessons()
    {
        self::isExists();

        $response['lessons'] = self::postOptions('lesson');
        wp_send_json_success($response, 200);
    }

    public static function refreshQuizzes()
    {
        self::isExists();

        $response['quizzes'] = self::postOptions('quiz');
        wp_send_json_success($response, 200);
    }

    private static function postOptions($postType)
    {
        $options = [];

        $posts = Post::all(
            [
                'post_type'   => $postType,
                'post_status' => 'publish',
                'numberposts' => -1,
            ]
        );

        foreach ($posts as $post) {
            $options[] = (object) [
                'value' => $post->ID,
                'label' => $post->post_title,
            ];
        }

        return $options;
    }
}
