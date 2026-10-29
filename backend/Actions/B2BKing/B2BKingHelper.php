<?php

namespace BitApps\Integrations\Actions\B2BKing;

use BitApps\Integrations\Core\Util\Post;

class B2BKingHelper
{
    public static function isExists()
    {
        if (!\defined('B2BKINGCORE_DIR')) {
            wp_send_json_error(
                __('B2BKing is not activated or not installed', 'bit-integrations'),
                400
            );
        }
    }

    public static function refreshGroups()
    {
        self::isExists();

        $posts = Post::all(
            [
                'post_type'   => 'b2bking_group',
                'numberposts' => -1,
                'post_status' => 'publish',
            ]
        );

        $groups = array_map(
            function ($post) {
                return (object) [
                    'value' => $post->ID,
                    'label' => $post->post_title,
                ];
            },
            $posts
        );

        wp_send_json_success(['groups' => $groups]);
    }
}
