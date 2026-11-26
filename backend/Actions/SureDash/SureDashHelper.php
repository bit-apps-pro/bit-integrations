<?php

namespace BitApps\Integrations\Actions\SureDash;

use BitApps\Integrations\Core\Util\Post;

class SureDashHelper
{
    public static function isExists()
    {
        if (!\defined('SUREDASHBOARD_POST_TYPE')) {
            wp_send_json_error(
                __('SureDash is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public function refreshSpaces()
    {
        self::isExists();

        $posts = Post::all(
            [
                'post_type'      => SUREDASHBOARD_POST_TYPE,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'title',
                'order'          => 'ASC',
            ]
        );

        $spaces = array_map(
            static function ($post) {
                return (object) [
                    'label' => $post->post_title,
                    'value' => $post->ID,
                ];
            },
            $posts
        );

        wp_send_json_success(['spaces' => $spaces], 200);
    }

    public function refreshPosts()
    {
        if (!\defined('SUREDASHBOARD_FEED_POST_TYPE')) {
            wp_send_json_error(__('SureDash is not activated or not installed', 'bit-integrations'), 400);
        }

        $posts = Post::all(
            [
                'post_type'      => SUREDASHBOARD_FEED_POST_TYPE,
                'post_status'    => 'publish',
                'posts_per_page' => -1,
                'orderby'        => 'date',
                'order'          => 'DESC',
            ]
        );

        $formatted = array_map(
            static function ($post) {
                return (object) [
                    'label' => $post->post_title ?: '(Untitled #' . $post->ID . ')',
                    'value' => $post->ID,
                ];
            },
            $posts
        );

        wp_send_json_success(['posts' => $formatted], 200);
    }
}
