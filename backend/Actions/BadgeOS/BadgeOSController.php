<?php

/**
 * BadgeOS Integration
 */

namespace BitApps\Integrations\Actions\BadgeOS;

use BitApps\Integrations\Core\Util\Post;
use WP_Error;

class BadgeOSController
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
