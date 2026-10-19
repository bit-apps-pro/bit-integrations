<?php

/**
 * Popup Maker Integration
 */

namespace BitApps\Integrations\Actions\PopupMaker;

use BitApps\Integrations\Core\Util\Post;

class PopupMakerHelper
{
    public static function isExists()
    {
        if (!\defined('POPMAKE_VERSION')) {
            wp_send_json_error(
                __(
                    'Popup Maker is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshPopups()
    {
        self::isExists();

        $response['popups'] = self::postDropdown('popup');

        wp_send_json_success($response, 200);
    }

    public function refreshThemes()
    {
        self::isExists();

        $response['themes'] = self::postDropdown('popup_theme');

        wp_send_json_success($response, 200);
    }

    private static function postDropdown($postType)
    {
        $options = [];

        $posts = Post::all(
            [
                'post_type'      => $postType,
                'post_status'    => ['publish', 'draft', 'pending', 'private'],
                'orderby'        => 'title',
                'order'          => 'ASC',
                'posts_per_page' => -1,
                'update_post_meta_cache' => false,
                'update_post_term_cache' => false,
            ]
        );

        foreach ($posts as $post) {
            $options[] = (object) [
                'id'    => $post->ID,
                'title' => $post->post_title !== '' ? $post->post_title : \sprintf('#%d', $post->ID),
            ];
        }

        return $options;
    }
}
