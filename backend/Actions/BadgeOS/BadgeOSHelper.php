<?php

namespace BitApps\Integrations\Actions\BadgeOS;

use BitApps\Integrations\Core\Util\Post;

class BadgeOSHelper
{
    public static function isExists()
    {
        if (!class_exists('BadgeOS')) {
            wp_send_json_error(
                __(
                    'BadgeOS is not activated or not installed',
                    'bit-integrations'
                ),
                400
            );
        }
    }

    public function refreshAchievements()
    {
        self::isExists();

        $achievements = [];

        if (\function_exists('badgeos_get_achievement_types_slugs')) {
            $achievementTypes = badgeos_get_achievement_types_slugs();

            if (!empty($achievementTypes)) {
                $posts = Post::all(
                    [
                        'post_type'      => $achievementTypes,
                        'post_status'    => 'publish',
                        'posts_per_page' => -1,
                        'orderby'        => 'title',
                        'order'          => 'ASC',
                    ]
                );

                $achievements = array_map(
                    function ($post) {
                        return (object) [
                            'achievement_id'   => $post->ID,
                            'achievement_name' => $post->post_title,
                            'achievement_type' => $post->post_type,
                        ];
                    },
                    $posts
                );
            }
        }

        $response['achievements'] = $achievements;
        wp_send_json_success($response, 200);
    }
}
